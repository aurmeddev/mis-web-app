"use client";
import { usePathname } from "next/navigation";
import { NotFound } from "../not-found/not-found";
import { NavMainItem } from "../sidebar/nav-main";

export function UserAccessController({
  children,
  navMain,
}: {
  children: React.ReactNode;
  navMain: NavMainItem;
}) {
  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };

  const pathname = usePathname();
  if (pathname === "/login") {
    return <>{children}</>;
  }
  const checkAccess = navMain.map((nav) =>
    nav.items?.some((item) => {
      return item.url === pathname;
    })
  );
  const hasAccess = checkAccess.some((access) => access === true);

  return <>{hasAccess ? children : <NotFound param={notFoundObj} />}</>;
}
