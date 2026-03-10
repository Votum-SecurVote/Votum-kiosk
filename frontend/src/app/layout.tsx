import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Secure E-Voting Kiosk | National",
  description: "Secure authentication portal for voting kiosk",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-brand-gray text-slate-900 antialiased min-h-screen flex flex-col`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm z-10 w-full shrink-0">
          <div className="flex items-center gap-4">
            <div className="rounded flex items-center justify-center overflow-hidden w-12 h-12 shadow-sm border border-gray-100">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">Voter Verification Kiosk</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Secure Authentication Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#dcfce7] text-[#166534] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border border-[#bbf7d0]">
              <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
              SYSTEM ONLINE
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button className="bg-gray-500 hover:bg-gray-600 text-white p-2.5 rounded-full transition-colors w-10 h-10 flex items-center justify-center font-bold">
              ?
            </button>
          </div>
        </header>
        
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}

// Client component for the clock
import { Clock } from "@/components/Clock";
