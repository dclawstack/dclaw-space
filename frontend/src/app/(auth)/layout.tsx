export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: brand panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#7660A8] to-[#3B1F6B] flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm">
          <div className="text-3xl font-bold mb-4">DClaw Space</div>
          <p className="text-xl font-medium text-white/90 mb-6">Your AI-native workplace OS</p>
          <p className="text-white/70 text-sm leading-relaxed">
            Stop wasting 60% of your office space. DClaw Space uses AI to predict attendance,
            optimize desk allocation, and reduce your carbon footprint — automatically.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">40%</p>
              <p className="text-xs text-white/70 mt-1">avg office utilization</p>
            </div>
            <div>
              <p className="text-2xl font-bold">31%</p>
              <p className="text-xs text-white/70 mt-1">no-show reduction</p>
            </div>
            <div>
              <p className="text-2xl font-bold">2.4×</p>
              <p className="text-xs text-white/70 mt-1">booking via chat</p>
            </div>
          </div>
        </div>
      </div>
      {/* Right: form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F9F8FC]">
        {children}
      </div>
    </div>
  )
}
