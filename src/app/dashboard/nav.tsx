"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  GanttChartSquare,
  ClipboardList,
  BadgeCheck,
  FileText,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", icon: <LayoutDashboard />, text: "Dashboard" },
  { href: "/dashboard/projects", icon: <GanttChartSquare />, text: "Projects" },
  { href: "/dashboard/checklists", icon: <ClipboardList />, text: "Checklists" },
  { href: "/dashboard/jhsa", icon: <FileText />, text: "JHSA" },
  { href: "/dashboard/profile", icon: <BadgeCheck />, text: "Certifications" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            tooltip={item.text}
            isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
          >
            <Link href={item.href}>
              {item.icon}
              <span>{item.text}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
