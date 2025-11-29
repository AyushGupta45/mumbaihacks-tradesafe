"use client";

import {
  BarChart,
  BriefcaseBusiness,
  Home,
  Settings,
  Copyright,
  Zap,
  Bot,
  LayoutDashboard
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Arbitrage", url: "/arbitrage", icon: Zap },
  { title: "Agents", url: "/agents", icon: Bot },
  { title: "Markets", url: "/markets", icon: BarChart },
  { title: "Portfolio", url: "/portfolio", icon: BriefcaseBusiness },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4 border-b gap-0">
        <Link href="/dashboard">
          <p className="text-2xl text-center font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            TradeSafe
          </p>
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground text-center">ARBITRAGE ENGINE</p>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={`py-6 ${pathname === item.url ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`} 
                    asChild
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="mr-2 h-5 w-5" />
                      <span className="text-base font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground flex flex-row items-center justify-center gap-1">
          <span>
            <Copyright size={14} />
          </span>
          <span>{new Date().getFullYear()} TradeSafe</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
