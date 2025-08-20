"use client";

import * as React from "react";
import {
  CircleDollarSign,
  Command,
  LayoutDashboardIcon,
  Users,
  Layers,
} from "lucide-react";

import { NavMain, NavMainItem } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  session: {
    user: { name: string; email: string; avatar: string };
    navMain: NavMainItem;
  };
};

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const data = {
    user: {
      name: session.user.name,
      email: session.user.email,
      avatar: session.user.avatar,
    },
    navMain: addIconPerMenu(session.navMain),
  };
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Aureas Media</span>
                  <span className=" text-xs">
                    Management Information System
                  </span>
                </div>
              </a>
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
  const icon = [Layers, Users, CircleDollarSign];
  return array.map((item, i) => ({
    ...item,
    icon: icon[i] ?? LayoutDashboardIcon, // fallback to a default icon if not enough icons
  }));
};
