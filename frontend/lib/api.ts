const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function optimizeLayout(floor_plan_id: string) {
  const res = await fetch(`${API_BASE}/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ floor_plan_id }),
  });
  if (!res.ok) throw new Error('Failed to optimize layout');
  return res.json();
}

export async function getHeatmap(planId: string) {
  const res = await fetch(`${API_BASE}/plans/${planId}/heatmap`);
  if (!res.ok) throw new Error('Failed to fetch heatmap');
  return res.json();
}
