"use client";

import * as React from "react";
import {
  CircleDollarSign,
  Command,
  LayoutDashboardIcon,
  Users,
  Layers,
  ShieldCheck,
} from "lucide-react";

import { NavMain, NavMainItem } from "@/components/sidebar/nav-main";
import { NavUser, NavUserProps } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  session: {
    user: NavUserProps & { navMain: NavMainItem };
  };
};

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const { navMain, ...user } = session.user;
  const data = {
    user: {
      full_name: user.full_name,
      display_name: user.display_name,
      gender: user.gender,
      email: user.email,
      avatar: user.avatar,
      user_type_name: user.user_type_name,
      team_name: user.team_name,
    },
    navMain: addIconPerMenu(navMain),
  };
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Aureas Media</span>
                  <span className="truncate text-xs">
                    Management Information System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

const addIconPerMenu = (array: any[]) => {
  const icon = [Layers, Users, ShieldCheck];
  return array.map((item, i) => {
    return {
      ...item,
      icon: icon[i] ?? LayoutDashboardIcon, // fallback to a default icon if not enough icons
    };
  });
};
