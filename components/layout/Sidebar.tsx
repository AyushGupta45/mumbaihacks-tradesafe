"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Bot, 
  Settings, 
  LineChart, 
  Wallet,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayout } from "@/context/LayoutContext";

const Sidebar = () => {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useLayout();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Arbitrage", href: "/arbitrage", icon: ArrowLeftRight },
    { name: "Agents", href: "/agents", icon: Bot },
    { name: "Markets", href: "/markets", icon: LineChart },
    { name: "Portfolio", href: "/portfolio", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 flex flex-col transition-all duration-300 ease-in-out glass rounded-2xl border-white/5",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-center border-b border-white/5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white">TradeSafe</span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">Pro Terminal</span>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-lg"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/20" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
              )}
              
              <item.icon 
                size={20} 
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-white"
                )} 
              />
              
              {!collapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>
          );
        })}
      </nav>

      {/* User/Status Section */}
      <div className="p-4 border-t border-white/5">
        <div className={cn(
          "rounded-xl bg-white/5 p-3 flex items-center gap-3 border border-white/5",
          collapsed ? "justify-center" : ""
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">AG</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">Ayush Gupta</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Active
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

