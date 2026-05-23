"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function AnimCount({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const { ref, visible } = useInView()
  useEffect(() => {
    if (!visible) return
    let cur = 0
    const step = target / 60
    const id = setInterval(() => {
      cur += step
      if (cur >= target) { setVal(target); clearInterval(id) } else { setVal(Math.floor(cur)) }
    }, 16)
    return () => clearInterval(id)
  }, [visible, target])
  return <span ref={ref}>{val}{suffix}</span>
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7660A8] flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className={`font-semibold transition-colors ${scrolled ? "text-[#1A1A2E]" : "text-white"}`}>DClaw Space</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          {[["#features","Features"],["#how-it-works","How it works"],["#pricing","Pricing"]].map(([href,label]) => (
            <a key={href} href={href} className={`transition-colors ${scrolled ? "text-[#3D3D4E] hover:text-[#7660A8]" : "text-white/80 hover:text-white"}`}>{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className={`text-sm transition-colors ${scrolled ? "text-[#3D3D4E] hover:text-[#7660A8]" : "text-white/80 hover:text-white"}`}>Sign in</Link>
          <Link href="/register" className="px-4 py-2 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] transition-colors">
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0F0A1E] pt-16">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#7660A8]/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#4A3580]/20 blur-3xl pointer-events-none" />
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7660A8]/40 bg-[#7660A8]/10 text-[#C4B5F4] text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7660A8] animate-pulse" />
          AI-native Workspace OS — YC S26
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Your office,<br />
          <span className="bg-gradient-to-r from-[#9B87D4] to-[#C4B5F4] bg-clip-text text-transparent">
            finally intelligent
          </span>
        </h1>
        <p className="text-lg md:text-xl text-[#9B9BAD] max-w-2xl mx-auto mb-10 leading-relaxed">
          DClaw Space eliminates the 40% of desk capacity wasted every day.
          AI-powered booking, real-time floor plans, and carbon tracking — all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register" className="px-8 py-3.5 rounded-full bg-[#7660A8] text-white font-semibold text-base hover:bg-[#8B72C2] transition-all shadow-lg shadow-[#7660A8]/30">
            Start for free →
          </Link>
          <Link href="/login" className="px-8 py-3.5 rounded-full border border-white/20 text-white font-medium text-base hover:bg-white/5 transition-all">
            Sign in
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[{n:40,s:"%",l:"desk waste eliminated"},{n:2,s:".4×",l:"booking completion"},{n:31,s:"%",l:"avg CO₂ reduction"}].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-bold text-white"><AnimCount target={s.n} suffix={s.s} /></p>
              <p className="text-xs text-[#9B9BAD] mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* App mockup */}
      <div className="relative z-10 mt-16 w-full max-w-5xl mx-auto px-6">
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-[#1A1228]">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#0F0A1E]/80 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            <span className="ml-4 text-[10px] text-white/30 font-mono">space.dclawstack.com/floors/1</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] h-56">
            <div className="bg-[#0F0A1E] border-r border-white/5 p-4 space-y-1.5">
              <div className="text-[10px] font-bold text-[#7660A8] mb-3">DClaw Space</div>
              {["Dashboard","Desks","Rooms","Floor Plans","Who's In","Analytics"].map((l,i) => (
                <div key={l} className={`text-[10px] px-2 py-1.5 rounded-md ${i===3?"bg-[#7660A8]/20 text-[#C4B5F4]":"text-white/30"}`}>{l}</div>
              ))}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/60 font-medium">Floor 1 — Live</span>
                <span className="text-[9px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>Live</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {Array.from({length:18}).map((_,i) => (
                  <div key={i} className={`h-9 rounded-lg text-[7px] flex items-center justify-center font-medium ${i<6?"bg-[#7660A8]/70 text-white":i<10?"bg-amber-500/60 text-white":i<12?"bg-green-500/60 text-white":"bg-white/5 text-white/20"}`}>
                    {`D${String(i+1).padStart(2,"0")}`}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-3">
                {[["#7660A8","Available"],["#F59E0B","Booked"],["#10B981","Checked in"]].map(([c,l])=>(
                  <div key={l} className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{background:c}}/><span className="text-[8px] text-white/40">{l}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-1">
        <span className="text-[10px] text-white/30">scroll</span>
        <div className="w-px h-6 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  )
}

function SocialProof() {
  const { ref, visible } = useInView()
  return (
    <section ref={ref} className={`py-14 bg-white border-y border-[#EBEBF0] transition-all duration-700 ${visible?"opacity-100 translate-y-0":"opacity-0 translate-y-4"}`}>
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-sm text-[#8888A0] mb-8 font-medium">Trusted by forward-thinking offices</p>
        <div className="flex flex-wrap items-center justify-center gap-12">
          {["Acme Corp","Nova Labs","Bright HQ","Apex Works","PulseOffice"].map(n=>(
            <span key={n} className="text-[#D1D1DB] text-lg font-bold tracking-tight select-none">{n}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Problem() {
  const { ref, visible } = useInView()
  return (
    <section ref={ref} className={`py-24 bg-[#F9F8FC] transition-all duration-700 ${visible?"opacity-100 translate-y-0":"opacity-0 translate-y-8"}`}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium mb-6">The Problem</div>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A2E] mb-6 leading-tight">
          You&apos;re paying for <span className="text-red-500">40% of your office</span> that nobody uses
        </h2>
        <p className="text-lg text-[#6B6B7B] max-w-2xl mx-auto leading-relaxed mb-12">
          Real estate is your second largest cost. Yet most companies have zero visibility into who&apos;s coming in, which desks are used, or where their money is going. DClaw Space fixes that.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {stat:"40%",label:"of desks empty on any given day",color:"text-red-500"},
            {stat:"$18K",label:"average cost per unused desk per year",color:"text-amber-500"},
            {stat:"0%",label:"of companies have real-time occupancy data",color:"text-[#7660A8]"},
          ].map(s=>(
            <div key={s.label} className="bg-white rounded-2xl border border-[#EBEBF0] p-8 shadow-sm">
              <p className={`text-5xl font-bold ${s.color} mb-3`}>{s.stat}</p>
              <p className="text-sm text-[#6B6B7B] leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  {icon:"🗓",title:"Smart Desk Booking",desc:"Instant booking with conflict detection. Browse by date, floor, or zone.",tag:"Core"},
  {icon:"🏢",title:"Interactive Floor Plans",desc:"Live SVG maps with real-time occupancy overlay. See exactly who's sitting where.",tag:"Visual"},
  {icon:"🤝",title:"Neighborhood Booking",desc:"Enter a teammate's ID and we'll suggest available desks closest to them.",tag:"Social"},
  {icon:"🤖",title:"AI Copilot",desc:"Streaming assistant that books desks, answers questions, and acts on your workspace in natural language.",tag:"AI"},
  {icon:"👁",title:"Who's In Today",desc:"Real-time presence dashboard — everyone booked in the office, grouped by floor and zone.",tag:"Presence"},
  {icon:"📊",title:"Analytics & Predictions",desc:"30-day utilization trends, per-floor breakdowns, and 14-day ML attendance forecasts.",tag:"Analytics"},
  {icon:"🌿",title:"ESG Dashboard",desc:"Track kWh saved, CO₂ offset, and tree-equivalents. Built for sustainability reports.",tag:"ESG"},
  {icon:"🧾",title:"Room Booking",desc:"Book meeting rooms by capacity and equipment. Ghost-meeting auto-cancel frees unused rooms.",tag:"Rooms"},
  {icon:"🔲",title:"QR Check-In",desc:"Each booking generates a QR code. Scan at the door — no app download required.",tag:"Check-In"},
  {icon:"🔔",title:"Waiting List",desc:"Fully booked? Join the waiting list and get notified the instant a desk opens.",tag:"Booking"},
  {icon:"🧑‍💼",title:"Visitor Management",desc:"Pre-register visitors, track arrivals, and issue digital badges — all in one view.",tag:"Visitors"},
  {icon:"💬",title:"Slack Bot",desc:"/desk-book grabs a desk for tomorrow. /who-is-in shows today's roster. No context switching.",tag:"Integrations"},
]

function Features() {
  const { ref, visible } = useInView(0.1)
  return (
    <section id="features" ref={ref} className={`py-24 bg-white transition-all duration-700 ${visible?"opacity-100 translate-y-0":"opacity-0 translate-y-8"}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-[#EDE9F7] text-[#7660A8] text-xs font-medium mb-4">Everything included</div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A2E] mb-4">One platform. Every workflow.</h2>
          <p className="text-lg text-[#6B6B7B] max-w-xl mx-auto">Everything your office needs — out of the box, no extra integrations required.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f,i)=>(
            <div key={f.title} className="group p-6 rounded-2xl border border-[#EBEBF0] hover:border-[#7660A8]/40 hover:shadow-lg hover:shadow-[#7660A8]/5 transition-all duration-300 bg-white" style={{transitionDelay:`${i*25}ms`}}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#F3F1F9] flex items-center justify-center text-xl shrink-0 group-hover:bg-[#EDE9F7] transition-colors">{f.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[#1A1A2E]">{f.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F1F9] text-[#7660A8] font-medium">{f.tag}</span>
                  </div>
                  <p className="text-sm text-[#6B6B7B] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AISection() {
  const { ref, visible } = useInView()
  return (
    <section ref={ref} className={`py-24 bg-[#0F0A1E] transition-all duration-700 ${visible?"opacity-100 translate-y-0":"opacity-0 translate-y-8"}`}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-[#7660A8]/20 text-[#C4B5F4] text-xs font-medium mb-6">AI-native</div>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Your workspace copilot,<br/>not just a chatbot</h2>
            <p className="text-[#9B9BAD] leading-relaxed mb-8">Unlike workspace tools that bolt on AI as an afterthought, DClaw Space is built AI-first. The copilot doesn&apos;t just answer questions — it takes actions.</p>
            <ul className="space-y-4">
              {[`"Book me a quiet desk near Alice on Thursday"`,`"Cancel all my room bookings next week"`,`"Which floor has the most availability tomorrow?"`,`"What's our utilization vs last month?"`].map(q=>(
                <li key={q} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#7660A8]/20 flex items-center justify-center text-[#C4B5F4] text-xs shrink-0">✓</span>
                  <span className="text-sm text-[#9B9BAD] italic">{q}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#1A1228] rounded-2xl border border-white/10 p-5 space-y-4">
            {[
              {role:"user",text:"Book me a standing desk near the engineering team tomorrow"},
              {role:"ai",text:"Found 3 standing desks in Zone A. Booking A-04 for you on Friday — 2 seats from Sarah and Mike. Confirmed ✅"},
              {role:"user",text:"How much CO₂ did we save this month?"},
              {role:"ai",text:"This month: 847 kg CO₂ saved — equivalent to planting 38 trees 🌳. Utilization up 12% vs last month."},
            ].map((m,i)=>(
              <div key={i} className={`flex gap-3 ${m.role==="user"?"flex-row-reverse":""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${m.role==="ai"?"bg-[#7660A8] text-white":"bg-white/10 text-white/60"}`}>{m.role==="ai"?"AI":"U"}</div>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${m.role==="ai"?"bg-[#7660A8]/20 text-[#C4B5F4] rounded-tl-sm":"bg-white/10 text-white/80 rounded-tr-sm"}`}>{m.text}</div>
              </div>
            ))}
            <div className="flex items-center gap-2 border-t border-white/5 pt-4">
              <input readOnly value="Ask about your workspace..." className="flex-1 bg-white/5 rounded-full px-4 py-2 text-xs text-white/30 outline-none"/>
              <div className="w-8 h-8 rounded-full bg-[#7660A8] flex items-center justify-center text-white text-xs">↑</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const { ref, visible } = useInView()
  return (
    <section id="how-it-works" ref={ref} className={`py-24 bg-[#F9F8FC] transition-all duration-700 ${visible?"opacity-100 translate-y-0":"opacity-0 translate-y-8"}`}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-[#EDE9F7] text-[#7660A8] text-xs font-medium mb-4">Simple setup</div>
          <h2 className="text-4xl font-bold text-[#1A1A2E] mb-4">Up and running in 10 minutes</h2>
          <p className="text-[#6B6B7B]">No IT team required. No complex integrations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-gradient-to-r from-[#7660A8]/20 via-[#7660A8]/60 to-[#7660A8]/20" />
          {[
            {step:"1",icon:"🏗",title:"Set up your office",desc:"Create floors, place desks and rooms. Takes under 5 minutes."},
            {step:"2",icon:"👥",title:"Invite your team",desc:"Share an invite link. Everyone gets an account and starts booking immediately."},
            {step:"3",icon:"🚀",title:"Let the AI handle it",desc:"The copilot learns patterns and keeps your space running at peak efficiency."},
          ].map(s=>(
            <div key={s.step} className="flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-white border border-[#EBEBF0] shadow-sm flex items-center justify-center text-3xl mb-5 relative">
                {s.icon}
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#7660A8] text-white text-xs font-bold flex items-center justify-center">{s.step}</span>
              </div>
              <h3 className="font-semibold text-[#1A1A2E] mb-2">{s.title}</h3>
              <p className="text-sm text-[#6B6B7B] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ESGSection() {
  const { ref, visible } = useInView()
  return (
    <section ref={ref} className={`py-24 bg-white transition-all duration-700 ${visible?"opacity-100 translate-y-0":"opacity-0 translate-y-8"}`}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 p-10 md:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium mb-6">ESG & Sustainability</div>
              <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4 leading-tight">Space savings are also carbon savings</h2>
              <p className="text-[#6B6B7B] leading-relaxed mb-6">Every optimised desk saves 0.8 kWh per day. DClaw Space makes that visible — perfect for investor reports and sustainability commitments.</p>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">See your impact →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {icon:"⚡",value:"0.8 kWh",label:"saved per unused desk/day"},
                {icon:"🌿",value:"0.23 kg",label:"CO₂ offset per kWh"},
                {icon:"🌳",value:"21.77 kg",label:"CO₂ absorbed per tree/year"},
                {icon:"📈",value:"Real-time",label:"ESG dashboard for reports"},
              ].map(s=>(
                <div key={s.label} className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="font-bold text-[#1A1A2E] text-sm">{s.value}</p>
                  <p className="text-xs text-[#6B6B7B] mt-0.5 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const { ref, visible } = useInView()
  const [annual, setAnnual] = useState(false)
  const PLANS = [
    {name:"Free",price:0,desc:"Perfect for small teams exploring smarter working",features:["10 desks","1 floor","5 users","Basic booking","Community support"],cta:"Get started",hi:false},
    {name:"Starter",price:99,badge:"Most Popular",desc:"For growing teams that need the full workspace OS",features:["50 desks","3 floors","25 users","AI Copilot","Analytics & predictions","Email support"],cta:"Start free trial",hi:true},
    {name:"Growth",price:299,desc:"For offices that need the full enterprise stack",features:["Unlimited desks & floors","200 users","Slack bot","ESG reporting","CSV export","Priority support"],cta:"Get started",hi:false},
  ]
  return (
    <section id="pricing" ref={ref} className={`py-24 bg-[#F9F8FC] transition-all duration-700 ${visible?"opacity-100 translate-y-0":"opacity-0 translate-y-8"}`}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-[#EDE9F7] text-[#7660A8] text-xs font-medium mb-4">Transparent pricing</div>
          <h2 className="text-4xl font-bold text-[#1A1A2E] mb-4">Start free. Scale as you grow.</h2>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm ${!annual?"text-[#1A1A2E] font-medium":"text-[#8888A0]"}`}>Monthly</span>
            <button onClick={()=>setAnnual(a=>!a)} className={`relative w-12 h-6 rounded-full transition-colors ${annual?"bg-[#7660A8]":"bg-[#EBEBF0]"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${annual?"translate-x-7":"translate-x-1"}`}/>
            </button>
            <span className={`text-sm ${annual?"text-[#1A1A2E] font-medium":"text-[#8888A0]"}`}>Annual <span className="text-green-600 font-medium">–20%</span></span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan=>(
            <div key={plan.name} className={`relative bg-white rounded-2xl border p-8 ${plan.hi?"border-[#7660A8] shadow-xl shadow-[#7660A8]/10":"border-[#EBEBF0] shadow-sm"}`}>
              {"badge" in plan && plan.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium bg-[#7660A8] text-white px-3 py-1 rounded-full">{plan.badge}</span>}
              <p className="text-sm font-semibold text-[#8888A0] mb-1">{plan.name}</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold text-[#1A1A2E]">{plan.price===0?"Free":`$${annual?Math.round(plan.price*.8):plan.price}`}</span>
                {plan.price>0&&<span className="text-sm text-[#8888A0] mb-1">/mo</span>}
              </div>
              {annual&&plan.price>0&&<p className="text-xs text-green-600 mb-3">Billed ${Math.round(plan.price*.8*12)}/year</p>}
              <p className="text-sm text-[#6B6B7B] mb-6 leading-snug">{plan.desc}</p>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map(f=>(
                  <li key={f} className="flex items-center gap-2 text-sm text-[#3D3D4E]">
                    <span className="text-[#7660A8] text-xs">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`block w-full py-2.5 rounded-full text-sm font-medium text-center transition-colors ${plan.hi?"bg-[#7660A8] text-white hover:bg-[#5E4B8B] shadow-lg shadow-[#7660A8]/30":"border border-[#EBEBF0] text-[#3D3D4E] hover:bg-[#F3F1F9]"}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-[#8888A0] mt-8">
          Need SSO, audit logs, or sensor API?{" "}
          <a href="mailto:sales@dclawstack.com" className="text-[#7660A8] hover:underline">Talk to us about Enterprise →</a>
        </p>
      </div>
    </section>
  )
}

function CTA() {
  const { ref, visible } = useInView()
  return (
    <section ref={ref} className={`py-32 bg-[#0F0A1E] relative overflow-hidden transition-all duration-700 ${visible?"opacity-100 translate-y-0":"opacity-0 translate-y-8"}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#7660A8]/15 blur-3xl"/>
      </div>
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Stop paying for empty desks</h2>
        <p className="text-lg text-[#9B9BAD] mb-10">Join offices saving thousands per month with smarter space management. Start free — no credit card required.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="px-8 py-4 rounded-full bg-[#7660A8] text-white font-semibold hover:bg-[#8B72C2] transition-all shadow-lg shadow-[#7660A8]/30">Get started free →</Link>
          <a href="#features" className="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-all">See all features</a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0F0A1E] border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7660A8] flex items-center justify-center"><span className="text-white text-xs font-bold">D</span></div>
          <span className="font-semibold text-white">DClaw Space</span>
          <span className="text-[#9B9BAD] text-sm ml-2">— Workspace OS</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-[#9B9BAD]">
          {["Features","Pricing","Docs","Privacy","Terms"].map(l=>(
            <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-xs text-[#6B6B7B]">© 2026 DClaw Stack. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="font-sans">
      <Nav />
      <Hero />
      <SocialProof />
      <Problem />
      <Features />
      <AISection />
      <HowItWorks />
      <ESGSection />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
