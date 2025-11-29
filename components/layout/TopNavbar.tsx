"use client";

import { Bell, Search, Command, User, Sun, Moon } from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";

const TopNavbar = () => {
  const { collapsed, theme, toggleTheme } = useLayout();

  return (
    <header 
      className={cn(
        "fixed top-4 right-4 h-16 z-50 flex items-center justify-between px-6 glass rounded-2xl border-white/5 transition-all duration-300 ease-in-out",
        collapsed ? "left-28" : "left-72" // Sync with main content margin
      )}
    >
      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search markets, agents, or opportunities..." 
            className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/30 focus:bg-black/40 transition-all light:bg-white/50 light:text-black light:placeholder:text-zinc-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
            <Command className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-medium text-zinc-500">K</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">All Systems Operational</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-colors group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0A0A0A] group-hover:scale-110 transition-transform" />
        </button>

        {/* Profile */}
        <button className="p-1 rounded-full border border-white/10 hover:border-white/20 transition-colors">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
            <User className="w-4 h-4 text-zinc-400" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
