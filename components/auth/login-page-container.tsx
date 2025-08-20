// import Image from "next/image";
// import backgroundImg from "@/public/images/login-bg.jpg";
export function LoginPageContainer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted gap-6 p-6 md:p-10">
      {/* <Image
        src={backgroundImg}
        placeholder="blur"
        alt="background-img"
        quality={100}
        fill
        sizes="100vw"
        className="absolute"
        style={{ objectFit: "cover" }}
        priority
      /> */}
      {children}
    </div>
  );
}
