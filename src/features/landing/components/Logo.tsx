import Image from "next/image";

type LogoProps = { size?: "md" | "lg" };

export default function Logo({ size = "md" }: LogoProps) {
  const heightClass = size === "lg" ? "h-20" : "h-16";
  return (
    <Image
      src="/asaanrabta-logo.png"
      alt="AsaanRabta"
      width={895}
      height={290}
      priority
      className={`${heightClass} w-auto`}
    />
  );
}
