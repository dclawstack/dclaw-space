import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { AuthProvider } from "@/context/AuthContext"
import AppShell from "@/components/AppShell"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "DClaw Space",
  description: "AI-native workspace optimization — desk booking, rooms, and floor plans",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-[#F8F8FA] font-sans antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
