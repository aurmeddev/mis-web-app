"use client";

import * as React from "react";
import { Lock, Paintbrush, Settings } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Dispatch, SetStateAction } from "react";
import { NotFound } from "../not-found/not-found";
import { ModeToggle } from "../theme/mode-toggle";
// import { CipherDataToolContainer } from "../settings/advance/CipherDataToolContainer/CipherDataToolContainer";
const settingOption = [
  { name: "Appearance", icon: Paintbrush },
  { name: "Account", icon: Lock },
  { name: "Advanced", icon: Settings },
];
type SettingsDialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  team_name: string;
};
export function SettingsDialog({
  open,
  setOpen,
  team_name,
}: SettingsDialogProps) {
  const [setting, setSetting] = React.useState(settingOption[0].name);
  const unavailableAlertInfo = {
    msg: "Oops! This feature is not available yet.",
    title: "",
  };
  const unauthorizedAccessAlertInfo = {
    msg: "Oops! You don't have permission to access this settings.",
    title: "",
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {settingOption.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === setting}
                          onClick={() => setSetting(item.name)}
                        >
                          <div>
                            <item.icon />
                            <span>{item.name}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink>Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{setting}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {setting === "Appearance" ? (
                <ModeToggle />
              ) : setting === "Advanced" && team_name === "Administrator" ? (
                // <CipherDataToolContainer />
                <NotFound param={unavailableAlertInfo} />
              ) : setting === "Account" ? (
                <NotFound param={unavailableAlertInfo} />
              ) : (
                <NotFound param={unauthorizedAccessAlertInfo} />
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
