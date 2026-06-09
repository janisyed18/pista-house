import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

import type { DietaryTag, MenuItem } from "@/data/menu";
import { formatCurrency } from "@/lib/hours";
import { cn } from "@/lib/utils";

export const DIETARY_TAG_LABELS: Record<DietaryTag, string> = {
  V: "Vegetarian",
  VG: "Vegan",
  H: "Halal",
  S: "Spicy",
  GF: "Gluten-Free",
};

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("mb-8", align === "center" && "mx-auto max-w-3xl text-center")}>
      {eyebrow ? (
        <p className={cn("mb-3 text-sm font-black uppercase tracking-[0.22em]", tone === "dark" ? "text-saffron-300" : "text-saffron-700")}>{eyebrow}</p>
      ) : null}
      <h2 className={cn("font-display text-4xl font-bold leading-none md:text-6xl", tone === "dark" ? "text-saffron-50 drop-shadow-[0_2px_18px_rgba(0,0,0,0.75)]" : "text-ink")}>{title}</h2>
      {children ? <div className={cn("mt-4 text-base leading-7 md:text-lg", tone === "dark" ? "text-white/86" : "text-charcoal/72")}>{children}</div> : null}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  icon: Icon,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  icon?: ComponentType<LucideProps>;
  variant?: "primary" | "outline" | "dark";
  external?: boolean;
}) {
  const className = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded px-5 py-3 text-sm font-black transition",
    variant === "primary" && "bg-saffron-300 text-burgundy-900 hover:bg-white",
    variant === "outline" && "border border-saffron-300 text-saffron-100 hover:bg-saffron-300 hover:text-burgundy-900",
    variant === "dark" && "bg-burgundy-900 text-white hover:bg-burgundy-700",
  );

  if (external || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a className={className} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {Icon ? <Icon aria-hidden className="h-4 w-4" /> : null}
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {Icon ? <Icon aria-hidden className="h-4 w-4" /> : null}
      {children}
    </Link>
  );
}

export function DietaryBadge({ tag, label = "short" }: { tag: DietaryTag; label?: "short" | "full" }) {
  return (
    <span
      title={DIETARY_TAG_LABELS[tag]}
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded border px-2 text-[11px] font-black",
        tag === "H" && "border-leaf/25 bg-leaf/10 text-leaf",
        tag === "S" && "border-burgundy-500/25 bg-burgundy-500/10 text-burgundy-700",
        tag === "V" && "border-emerald-700/25 bg-emerald-50 text-emerald-700",
        tag === "VG" && "border-emerald-800/25 bg-emerald-100 text-emerald-800",
        tag === "GF" && "border-saffron-700/25 bg-saffron-100 text-saffron-700",
      )}
    >
      {label === "full" ? DIETARY_TAG_LABELS[tag] : tag}
    </span>
  );
}

export function FoodTypeIndicator({ tags }: { tags: DietaryTag[] }) {
  const isVeg = tags.includes("V") || tags.includes("VG") || !tags.includes("H");

  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded border px-2 text-[11px] font-black", isVeg ? "border-emerald-700/25 bg-emerald-50 text-emerald-700" : "border-red-700/25 bg-red-50 text-red-700")}>
      <span className={cn("h-2.5 w-2.5 rounded-full", isVeg ? "bg-emerald-600" : "bg-red-600")} aria-hidden />
      {isVeg ? "Veg" : "Non-veg"}
    </span>
  );
}

export function MenuItemCard({
  item,
  compact = false,
  actionHref = "/order",
}: {
  item: MenuItem;
  compact?: boolean;
  actionHref?: string;
}) {
  return (
    <article className="group overflow-hidden rounded border border-black/8 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className={cn("relative bg-smoke", compact ? "aspect-[4/3]" : "aspect-[4/3]")}>
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {item.popular ? (
          <span className="absolute left-3 top-3 rounded bg-saffron-300 px-3 py-1 text-xs font-black text-burgundy-900">
            Most Ordered
          </span>
        ) : null}
        {item.weekendOnly ? (
          <span className="absolute right-3 top-3 rounded bg-burgundy-900 px-3 py-1 text-xs font-black text-white">
            Weekend
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <p className="mb-2 text-[11px] text-charcoal/48">Illustrative image only</p>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-black leading-tight text-ink">{item.name}</h3>
          <p className="shrink-0 font-black text-burgundy-700">{formatCurrency(item.price)}</p>
        </div>
        <p className="mt-2 min-h-12 text-sm leading-6 text-charcoal/68">{item.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {item.dietaryTags.map((tag) => (
              <DietaryBadge key={tag} tag={tag} />
            ))}
          </div>
          <Link href={`${actionHref}?item=${item.id}`} className="rounded bg-burgundy-900 px-3 py-2 text-xs font-black text-white transition hover:bg-burgundy-700">
            Add to Order
          </Link>
        </div>
      </div>
    </article>
  );
}

export function StatusTracker({ activeIndex = 1 }: { activeIndex?: number }) {
  const stages = ["Order Received", "Preparing", "Ready for Pickup"];

  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {stages.map((stage, index) => (
        <li key={stage} className="flex items-center gap-3 rounded border border-white/15 bg-white/8 p-3">
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black",
              index <= activeIndex ? "bg-saffron-300 text-burgundy-900" : "bg-white/10 text-white/50",
            )}
          >
            {index + 1}
          </span>
          <span className={cn("text-sm font-bold", index <= activeIndex ? "text-white" : "text-white/55")}>
            {stage}
          </span>
        </li>
      ))}
    </ol>
  );
}
