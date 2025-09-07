import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { ThemeProvider } from "@/components/theme/theme-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { UserActivityContextProvider } from "@/components/auth/context/UserActivityContextProvider";
import { UserAccessController } from "@/components/auth/user-access-controller";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIS Web App",
  description: "Developed by Aureas Media Dev Team",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const userInfo = session ? session : "";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserActivityContextProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {session ? (
              <SidebarProvider>
                <AppSidebar session={userInfo} />
                <SidebarInset className="w-[calc(100%-16rem)]">
                  <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-input">
                    <div className="flex items-center gap-2 px-4">
                      <SidebarTrigger className="-ml-1" />
                    </div>
                  </header>
                  <main className="w-full overflow-hidden">
                    <UserAccessController navMain={session.user.navMain}>
                      {children}
                    </UserAccessController>
                  </main>
                </SidebarInset>
              </SidebarProvider>
            ) : (
              children
            )}
          </ThemeProvider>
        </UserActivityContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
