import type { ReactNode } from "react";

type ContainerProps = { className?: string; children: ReactNode };

export default function Container({
  className = "",
  children,
}: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-6 md:px-10 ${className}`}>
      {children}
    </div>
  );
}
