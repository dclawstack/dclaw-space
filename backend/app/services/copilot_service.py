"""AI Space Copilot — LLM orchestration with booking tool-calling.

Uses OpenRouter (OPENROUTER_API_KEY env var) or falls back to a
rule-based responder so the UI works without any API key.
"""
import json
import os
from typing import AsyncGenerator
import httpx

from app.core.utils import utc_now

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = os.getenv("COPILOT_MODEL", "openai/gpt-4o-mini")

SYSTEM_PROMPT = """You are DClaw Space Copilot, an AI assistant for a workplace management platform.
You help users book desks and meeting rooms, check availability, and understand space utilization.

You have access to the following tools:
- search_desks(date, floor_id?): find available desks
- book_desk(desk_id, date): book a specific desk
- search_rooms(start_dt, end_dt, capacity_min?): find available rooms
- book_room(room_id, title, start_dt, end_dt, attendee_count): book a room
- get_my_bookings(): list user's upcoming bookings
- cancel_booking(booking_id, type): cancel a desk or room booking
- get_floor_occupancy(floor_id, date): see floor occupancy map

When the user asks to do something actionable, respond with a JSON action block in this format:
<action>{"tool": "book_desk", "params": {"desk_id": "...", "date": "2026-06-01"}}</action>

Always be concise, friendly, and proactive. Surface useful insights like "Your usual floor is 90% full on Friday."
"""


async def stream_copilot_response(
    messages: list[dict],
    context: dict,
    user_id: str,
) -> AsyncGenerator[str, None]:
    """Yields SSE-formatted chunks: data: {role, content, done}\n\n"""

    full_messages = [
        {"role": "system", "content": SYSTEM_PROMPT + f"\n\nCurrent user: {user_id}\nContext: {json.dumps(context)}"},
        *messages,
    ]

    if not OPENROUTER_API_KEY:
        async for chunk in _rule_based_response(messages[-1]["content"] if messages else ""):
            yield chunk
        return

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            async with client.stream(
                "POST",
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://dclaw.space",
                },
                json={
                    "model": DEFAULT_MODEL,
                    "messages": full_messages,
                    "stream": True,
                    "max_tokens": 800,
                },
            ) as response:
                if response.status_code != 200:
                    yield f'data: {{"role":"assistant","content":"LLM service unavailable (HTTP {response.status_code}). Using fallback.","done":false}}\n\n'
                    async for chunk in _rule_based_response(messages[-1]["content"] if messages else ""):
                        yield chunk
                    return

                buffer = ""
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    raw = line[6:]
                    if raw == "[DONE]":
                        break
                    try:
                        data = json.loads(raw)
                        delta = data["choices"][0]["delta"].get("content", "")
                        if delta:
                            buffer += delta
                            yield f'data: {json.dumps({"role": "assistant", "content": delta, "done": False})}\n\n'
                    except (json.JSONDecodeError, KeyError):
                        continue

                yield f'data: {json.dumps({"role": "assistant", "content": "", "done": True, "full": buffer})}\n\n'

    except httpx.RequestError as e:
        yield f'data: {{"role":"assistant","content":"Connection error: {str(e)[:100]}. Using fallback.","done":false}}\n\n'
        async for chunk in _rule_based_response(messages[-1]["content"] if messages else ""):
            yield chunk


async def _rule_based_response(user_message: str) -> AsyncGenerator[str, None]:
    """Fallback when no API key is configured."""
    msg = user_message.lower()

    if any(w in msg for w in ["book", "reserve", "desk"]):
        response = (
            "I can help you book a desk! Head to the **Desks** page, pick a date, "
            "and click **Book** on any available desk. Or tell me a specific date and "
            "I'll show you options once connected to an LLM provider."
        )
    elif any(w in msg for w in ["room", "meeting", "conference"]):
        response = (
            "For meeting rooms, go to the **Rooms** page, set your time window and "
            "minimum capacity, and click **Search**. I can make this smarter with "
            "an OpenRouter API key."
        )
    elif any(w in msg for w in ["available", "free", "open"]):
        response = (
            "Check the **Desks** or **Rooms** page for real-time availability. "
            "The **Floor Plans** page shows a live occupancy map."
        )
    elif any(w in msg for w in ["cancel", "delete"]):
        response = "Go to **My Bookings** to cancel any upcoming desk or room reservation."
    elif any(w in msg for w in ["utilization", "analytics", "usage"]):
        response = "Check the **Analytics** page for utilization trends, floor-level breakdowns, and ESG metrics."
    elif any(w in msg for w in ["esg", "carbon", "sustainability"]):
        response = "The **ESG Dashboard** shows estimated kWh saved and CO₂ offset from your unused desk-days."
    else:
        response = (
            "I'm DClaw Space Copilot. I can help with desk/room bookings, "
            "floor availability, and space analytics. Set OPENROUTER_API_KEY "
            "in your environment for full AI capabilities."
        )

    # Simulate streaming
    words = response.split()
    for i, word in enumerate(words):
        content = word + (" " if i < len(words) - 1 else "")
        yield f'data: {json.dumps({"role": "assistant", "content": content, "done": False})}\n\n'

    yield f'data: {json.dumps({"role": "assistant", "content": "", "done": True, "full": response})}\n\n'
