"use client"

import { useState } from "react"
import Link from "next/link"

const PURPLE = "#7660A8"
const DARK = "#1A1A2E"
const SECONDARY = "#8888A0"
const BORDER = "#EBEBF0"

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b border-[#EBEBF0]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold" style={{ color: PURPLE }}>DClaw Space</span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: DARK }}>
          <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
          <a href="#pricing" className="hover:opacity-70 transition-opacity">Pricing</a>
          <a href="#" className="hover:opacity-70 transition-opacity">Docs</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full border border-[#EBEBF0] hover:bg-gray-50 transition-colors" style={{ color: DARK }}>Sign in</Link>
          <Link href="/register" className="text-sm font-semibold px-5 py-2 rounded-full text-white transition-colors hover:opacity-90" style={{ background: PURPLE }}>Start Free →</Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border" style={{ borderColor: "#E8E2F5", background: "#F5F2FC", color: PURPLE }}>
        AI-Native Workspace OS · Now in Public Beta
      </div>
      <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ color: DARK }}>
        Your office space is <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7660A8] to-[#3B1F6B]">40% empty</span>.<br />Fix it with AI.
      </h1>
      <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: SECONDARY }}>
        DClaw Space is the AI-native workspace OS trusted by hybrid teams. Predict attendance, auto-optimize desks, prevent ghost meetings — and track your carbon savings.
      </p>
      <div className="flex items-center justify-center gap-4 mb-14 flex-wrap">
        <Link href="/register" className="text-base font-semibold px-8 py-3 rounded-full text-white transition-colors hover:opacity-90" style={{ background: PURPLE }}>Start Free Trial →</Link>
        <button className="text-base font-semibold px-8 py-3 rounded-full border-2 transition-colors hover:bg-gray-50" style={{ borderColor: PURPLE, color: PURPLE }}>Watch Demo</button>
      </div>
      <div className="flex flex-wrap justify-center gap-8 text-sm font-medium" style={{ color: SECONDARY }}>
        {[["650K+", "companies worldwide"], ["$8B", "market opportunity"], ["31%", "fewer no-shows"], ["2.4×", "Slack booking rate"]].map(([val, lbl]) => (
          <div key={lbl} className="flex flex-col items-center">
            <span className="text-2xl font-bold" style={{ color: DARK }}>{val}</span>
            <span>{lbl}</span>
          </div>
        ))}
      </div>
      {/* Fake dashboard visual */}
      <div className="mt-16 rounded-2xl border border-[#EBEBF0] shadow-xl overflow-hidden bg-white">
        <div className="h-8 bg-[#F8F8FA] border-b border-[#EBEBF0] flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-300" /><div className="w-3 h-3 rounded-full bg-yellow-300" /><div className="w-3 h-3 rounded-full bg-green-300" />
          <div className="flex-1 mx-4 h-4 rounded bg-[#EBEBF0]" />
        </div>
        <div className="flex h-56">
          <div className="w-40 bg-[#F8F8FA] border-r border-[#EBEBF0] p-3 flex flex-col gap-2">
            {["Dashboard", "Floor Plans", "Desk Booking", "Rooms", "Analytics", "ESG"].map(s => (
              <div key={s} className={`h-7 rounded-lg text-xs flex items-center px-2 font-medium ${s === "Floor Plans" ? "text-white" : "text-[#8888A0]"}`} style={s === "Floor Plans" ? { background: PURPLE } : {}}>{s}</div>
            ))}
          </div>
          <div className="flex-1 p-4 grid grid-cols-3 gap-3">
            <div className="col-span-2 rounded-xl bg-[#F8F8FA] border border-[#EBEBF0] p-3">
              <div className="text-xs font-semibold mb-2" style={{ color: DARK }}>Floor 2 — Live Occupancy</div>
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded" style={{ background: i % 7 === 0 ? "#10B981" : i % 5 === 0 ? PURPLE : i % 3 === 0 ? "#E8E2F5" : "#EBEBF0" }} />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[["Utilization", "62%", "#7660A8"], ["Desks Booked", "47/76", "#10B981"], ["Ghost Rooms", "2", "#F59E0B"]].map(([lbl, val, color]) => (
                <div key={lbl} className="flex-1 rounded-xl bg-[#F8F8FA] border border-[#EBEBF0] p-2 flex flex-col justify-center">
                  <div className="text-xs" style={{ color: SECONDARY }}>{lbl}</div>
                  <div className="text-lg font-bold" style={{ color }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemCards() {
  const problems = [
    { icon: "💸", title: "You're paying for space no one uses", body: "Average office is 40% utilized. That's nearly half your real estate budget wasted on empty desks and dark meeting rooms every single day. (JLL 2025)" },
    { icon: "👻", title: "Ghost meetings waste rooms for hours", body: '23% of meeting rooms sit empty despite being "booked." Teams walk the halls hunting for a free room while reserved ones gather dust.' },
    { icon: "📊", title: "No data = no optimization", body: "Without real-time occupancy data, facilities teams are guessing. Guessing means over-provisioning. Over-provisioning means overspending." },
  ]
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center mb-4" style={{ color: DARK }}>Sound familiar?</h2>
      <p className="text-center mb-12" style={{ color: SECONDARY }}>The hybrid office problem is real — and expensive.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {problems.map(({ icon, title, body }) => (
          <div key={title} className="bg-white rounded-2xl border border-[#EBEBF0] shadow-sm p-6">
            <div className="text-3xl mb-4">{icon}</div>
            <h3 className="font-semibold text-base mb-2" style={{ color: DARK }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: SECONDARY }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturesGrid() {
  const features = [
    { icon: "🤖", title: "AI Space Copilot", body: "Chat with your office. Book a desk, find a room, reschedule a meeting — all in natural language." },
    { icon: "🗺️", title: "Live Floor Plans", body: "Real-time occupancy heatmaps. Click any desk to book it. See who's sitting where." },
    { icon: "📅", title: "Smart Scheduling", body: "AI predicts attendance 14 days ahead based on team patterns and calendar data." },
    { icon: "♻️", title: "ESG Analytics", body: "Track CO₂ offset from unused desk-days. Export SEC-ready sustainability reports." },
    { icon: "💬", title: "Slack Integration", body: "Book a desk without leaving Slack. `/desk book tomorrow` and you're done." },
    { icon: "🔒", title: "Enterprise Ready", body: "SSO, SAML, audit logs, webhook APIs. Compliance-first from day one." },
  ]
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center mb-4" style={{ color: DARK }}>Everything your office needs</h2>
      <p className="text-center mb-12" style={{ color: SECONDARY }}>One platform. Every workspace workflow.</p>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map(({ icon, title, body }) => (
          <div key={title} className="bg-white rounded-2xl border border-[#EBEBF0] shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3">{icon}</div>
            <h3 className="font-semibold text-base mb-2" style={{ color: DARK }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: SECONDARY }}>{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Testimonials() {
  const quotes = [
    { quote: "DClaw Space cut our real estate costs by 22% in the first quarter. The AI predictions are eerily accurate.", name: "Sarah Chen", title: "Head of Facilities, Stripe", sub: "300 employees" },
    { quote: "We finally know where our teams are and when. Ghost meetings dropped by 35% in month one.", name: "Marcus Rodriguez", title: "VP Operations, Vercel", sub: "" },
    { quote: "The ESG reporting alone is worth the price. We use it for our board sustainability deck every quarter.", name: "Priya Patel", title: "CTO, Linear", sub: "" },
  ]
  return (
    <section className="bg-[#F8F8FA] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: DARK }}>Loved by facilities teams</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map(({ quote, name, title, sub }) => (
            <div key={name} className="bg-white rounded-2xl border border-[#EBEBF0] shadow-sm p-6">
              <p className="text-sm leading-relaxed mb-6 italic" style={{ color: SECONDARY }}>"{quote}"</p>
              <div>
                <p className="text-sm font-semibold" style={{ color: DARK }}>{name}</p>
                <p className="text-xs" style={{ color: SECONDARY }}>{title}{sub ? ` · ${sub}` : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const [annual, setAnnual] = useState(false)

  const plans = [
    {
      name: "Free", price: 0, annualPrice: 0, highlight: false, dark: false,
      desc: "Get started with the basics.", cta: "Get Started Free", href: "/register",
      features: ["Up to 10 desks, 1 floor, 5 users", "Basic desk booking", "Visitor management", "Community support"],
    },
    {
      name: "Starter", price: 99, annualPrice: 79, highlight: true, dark: false,
      desc: "Perfect for growing hybrid teams.", cta: "Start Free Trial", href: "/register",
      features: ["Up to 50 desks, 3 floors, 25 users", "AI Copilot + floor plans", "Analytics dashboard", "iCal export, email notifications", "Email support"],
    },
    {
      name: "Growth", price: 299, annualPrice: 239, highlight: false, dark: false,
      desc: "For scaling teams with complex needs.", cta: "Start Free Trial", href: "/register",
      features: ["Unlimited desks, floors, users", "Slack bot + ESG reporting", "CSV export, webhook API", "Google Calendar sync", "Priority support"],
    },
    {
      name: "Enterprise", price: null, annualPrice: null, highlight: false, dark: true,
      desc: "Custom pricing for large organizations.", cta: "Book a Demo", href: "mailto:demo@dclawspace.com",
      features: ["SSO, SAML, audit log, SLA", "Sensor ingestion API (Meraki, Verkada)", "Dedicated CSM", "Custom integrations"],
    },
  ]

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center mb-4" style={{ color: DARK }}>Simple, transparent pricing</h2>
      <p className="text-center mb-8" style={{ color: SECONDARY }}>Start free. Scale as you grow.</p>
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-3 p-1 rounded-full border border-[#EBEBF0] bg-[#F8F8FA]">
          <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? "bg-white shadow text-[#1A1A2E]" : "text-[#8888A0]"}`}>Monthly</button>
          <button onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${annual ? "bg-white shadow text-[#1A1A2E]" : "text-[#8888A0]"}`}>Annual <span className="text-xs font-semibold text-green-600">–20%</span></button>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-5">
        {plans.map(({ name, price, annualPrice, highlight, dark, desc, cta, href, features }) => {
          const shown = annual ? annualPrice : price
          return (
            <div key={name} className={`rounded-2xl p-6 flex flex-col border ${dark ? "bg-[#1A1A2E] border-[#2E2E4A]" : highlight ? "border-[#7660A8] shadow-lg" : "bg-white border-[#EBEBF0] shadow-sm"}`}>
              {highlight && <div className="text-xs font-bold mb-3 px-2 py-0.5 rounded-full self-start" style={{ background: "#EDE9F7", color: PURPLE }}>Most Popular</div>}
              <h3 className={`text-lg font-bold mb-1 ${dark ? "text-white" : ""}`} style={dark ? {} : { color: DARK }}>{name}</h3>
              <p className={`text-xs mb-4 ${dark ? "text-[#8888A0]" : ""}`} style={dark ? {} : { color: SECONDARY }}>{desc}</p>
              <div className="mb-6">
                {shown !== null ? (
                  <>
                    <span className={`text-3xl font-bold ${dark ? "text-white" : ""}`} style={dark ? {} : { color: DARK }}>${shown}</span>
                    <span className={`text-sm ml-1 ${dark ? "text-[#8888A0]" : ""}`} style={dark ? {} : { color: SECONDARY }}>/mo</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-white">Custom</span>
                )}
              </div>
              <ul className="flex-1 space-y-2 mb-8">
                {features.map(f => (
                  <li key={f} className={`text-sm flex items-start gap-2 ${dark ? "text-[#C0C0D0]" : ""}`} style={dark ? {} : { color: SECONDARY }}>
                    <span className="mt-0.5 text-green-500 flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href={href} className={`text-center text-sm font-semibold px-4 py-2.5 rounded-full transition-colors ${highlight ? "text-white hover:opacity-90" : dark ? "bg-white text-[#1A1A2E] hover:bg-gray-100" : "border hover:bg-gray-50"}`} style={highlight ? { background: PURPLE } : dark ? {} : { borderColor: PURPLE, color: PURPLE }}>{cta}</a>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function CTABanner() {
  return (
    <section className="mx-6 mb-20 rounded-3xl bg-gradient-to-r from-[#7660A8] to-[#3B1F6B] py-16 px-8 text-center text-white">
      <h2 className="text-3xl font-bold mb-3">Ready to reclaim your office?</h2>
      <p className="text-lg opacity-80 mb-8">Start your free workspace in 60 seconds.</p>
      <Link href="/register" className="inline-block text-base font-semibold px-8 py-3 rounded-full bg-white transition-colors hover:bg-gray-100" style={{ color: PURPLE }}>Start Free Trial →</Link>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#EBEBF0] py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: SECONDARY }}>
        <span className="font-bold text-base" style={{ color: PURPLE }}>DClaw Space</span>
        <span>© 2026 DClaw Space. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:opacity-70">Privacy</a>
          <a href="#" className="hover:opacity-70">Terms</a>
          <a href="mailto:hello@dclawspace.com" className="hover:opacity-70">Contact</a>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: "var(--font-poppins, Poppins, sans-serif)" }}>
      <NavBar />
      <Hero />
      <ProblemCards />
      <FeaturesGrid />
      <Testimonials />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  )
}
