import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dota 2 Lineup Manager",
  description: "Create and manage custom Dota 2 lineups by role",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 pb-16"> {/* Added padding bottom to ensure content isn't hidden behind the footer */}
              {children}
            </main>
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
