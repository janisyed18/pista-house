import Image from "next/image";

import { cn } from "@/lib/utils";

type PistaHouseLogoProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  showSuburb?: boolean;
  tone?: "light" | "dark";
};

export function PistaHouseLogo({ className, imageClassName, priority = false, showSuburb = true, tone = "dark" }: PistaHouseLogoProps) {
  const isDark = tone === "dark";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center",
          isDark ? "rounded-none border-0 bg-transparent p-0 shadow-none" : "rounded border border-black/8 bg-[#fffdf8] px-2.5 py-1 text-ink shadow-sm",
        )}
      >
        <Image
          src="/brand/pista-house-wordmark.svg"
          alt="Pista House"
          width={180}
          height={52}
          priority={priority}
          className={cn(
            "block h-11 w-40 object-contain md:h-12 md:w-44",
            isDark && "drop-shadow-[0_1px_0_rgba(255,233,179,0.22)]",
            imageClassName,
          )}
        />
      </span>
      {showSuburb ? (
        <span className={cn("hidden leading-tight sm:block", isDark ? "text-white" : "text-ink")}>
          <span className="block text-xs font-black uppercase tracking-[0.24em] text-saffron-100">Wentworthville</span>
          <span className={cn("block text-[11px] font-bold uppercase tracking-[0.18em]", isDark ? "text-white/55" : "text-charcoal/50")}>
            Hyderabadi Cuisine
          </span>
        </span>
      ) : null}
    </span>
  );
}
