import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickDraw Documentation",
  description: "Official documentation for the QuickDraw collaborative whiteboarding app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-white selection:bg-purple-100 selection:text-purple-900`}>
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
          <div className="wf-grid opacity-[0.03]" />
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-100/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <Navbar />
        
        <div className="flex pt-[110px] max-w-7xl mx-auto px-6 lg:px-12 relative z-10 min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-72 py-12 min-h-screen">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
