import Image from "next/image";
import { getSession } from "@/lib/security/user-auth/jwt/JwtAuthService";
import { redirect } from "next/navigation";
export default async function Home() {
  //  const session = await getSession();
  // if (!session) {
  //   redirect("/login");
  // }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-row w-full"></div>
      </main>
    </div>
  );
}
