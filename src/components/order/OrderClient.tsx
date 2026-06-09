"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, CreditCard, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { DietaryBadge } from "@/components/ui";
import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { formatCurrency } from "@/lib/hours";
import type { MergedMenuCategory, MergedMenuItem } from "@/lib/menu";
import { calculateOrderTotals, menuItemToCartLine } from "@/lib/order";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

const slotOptions = ["ASAP", "12:30", "13:00", "13:30", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

export function OrderClient({ menuCategories }: { menuCategories: MergedMenuCategory[] }) {
  const searchParams = useSearchParams();
  const initialCategory = menuCategories.some((group) => group.slug === "plates") ? "plates" : (menuCategories[0]?.slug ?? "all");
  const [category, setCategory] = useState(initialCategory);
  const [pickupTime, setPickupTime] = useState("ASAP");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<{ id: string; name: string } | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lines = useCartStore((state) => state.lines);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const totals = useMemo(() => calculateOrderTotals(lines), [lines]);

  useEffect(() => {
    const item = searchParams.get("item");
    if (item) {
      const menuItem = menuCategories.flatMap((group) => group.items).find((entry) => entry.id === item);
      if (menuItem) {
        addItem(menuItemToCartLine(menuItem));
      }
    }
  }, [addItem, menuCategories, searchParams]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const activeItems = useMemo(() => menuCategories.find((group) => group.slug === category)?.items ?? [], [category, menuCategories]);

  function addMenuItem(item: MergedMenuItem) {
    addItem(menuItemToCartLine(item));
    setAddedFeedback({ id: item.id, name: item.name });
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => setAddedFeedback(null), 1400);
  }

  async function checkout() {
    setLoading(true);
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines, pickupTime, customerName, customerEmail, customerPhone }),
    });
    const data = await response.json();
    window.location.href = data.url;
  }

  return (
    <div className="grid min-w-0 gap-8 xl:grid-cols-[220px_minmax(0,1fr)_400px]">
      <aside className="hidden xl:block">
        <nav className="sticky top-28 grid gap-2" aria-label="Order categories">
          {menuCategories.map((group) => (
            <button
              key={group.slug}
              type="button"
              onClick={() => setCategory(group.slug)}
              className={`rounded border px-4 py-3 text-left text-sm font-black ${category === group.slug ? "border-burgundy-900 bg-burgundy-900 text-white" : "border-black/8 bg-white"}`}
            >
              {group.name}
            </button>
          ))}
        </nav>
      </aside>

      <section className="min-w-0">
        <div className="mb-5 flex min-w-0 gap-2 overflow-x-auto xl:hidden">
          {menuCategories.map((group) => (
            <button
              key={group.slug}
              type="button"
              onClick={() => setCategory(group.slug)}
              className={`shrink-0 rounded px-4 py-2 text-sm font-black ${category === group.slug ? "bg-burgundy-900 text-white" : "bg-white text-charcoal"}`}
            >
              {group.name}
            </button>
          ))}
        </div>
        <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
          {activeItems.map((item, index) => (
            <article
              key={item.id}
              className={cn(
                "grid min-w-0 gap-4 rounded border bg-white p-3 shadow-sm transition duration-200 sm:grid-cols-[128px_minmax(0,1fr)]",
                addedFeedback?.id === item.id ? "border-leaf/55 ring-2 ring-leaf/20" : "border-black/8",
              )}
            >
              <div className="relative aspect-square overflow-hidden rounded bg-smoke">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="128px"
                  priority={category === "plates" && index < 2}
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <h2 className="min-w-0 break-words font-black leading-tight text-ink">{item.name}</h2>
                  <p className="shrink-0 whitespace-nowrap font-black text-burgundy-700">{formatCurrency(item.price)}</p>
                </div>
                <p className="mt-2 text-sm leading-5 text-charcoal/65">{item.description}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-1">
                    {item.dietaryTags.map((tag) => (
                      <DietaryBadge key={tag} tag={tag} />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addMenuItem(item)}
                    disabled={addedFeedback?.id === item.id}
                    className={cn(
                      "inline-flex min-w-[88px] items-center justify-center gap-2 rounded px-3 py-2 text-xs font-black text-white transition disabled:cursor-default",
                      addedFeedback?.id === item.id ? "bg-leaf shadow-[0_0_0_4px_rgba(38,118,90,0.14)]" : "bg-burgundy-900 hover:bg-burgundy-700",
                    )}
                  >
                    {addedFeedback?.id === item.id ? <CheckCircle2 aria-hidden className="h-3.5 w-3.5" /> : <Plus aria-hidden className="h-3.5 w-3.5" />}
                    {addedFeedback?.id === item.id ? "Added" : "Add"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="xl:sticky xl:top-28 xl:self-start">
        <div className="rounded border border-black/8 bg-white p-5 shadow-lift">
          <div className="mb-5 flex items-center gap-2">
            <ShoppingBag aria-hidden className="h-5 w-5 text-burgundy-700" />
            <h2 className="text-xl font-black">Your Pickup Order</h2>
          </div>
          <div aria-live="polite" aria-atomic="true" className="mb-4 min-h-11">
            {addedFeedback ? (
              <div className="flex min-h-11 items-center gap-2 rounded border border-leaf/20 bg-leaf/10 px-3 py-2 text-sm font-black text-leaf">
                <CheckCircle2 aria-hidden className="h-4 w-4" />
                Added {addedFeedback.name} to your order
              </div>
            ) : null}
          </div>
          <label className="mb-5 block">
            <span className="mb-2 flex items-center gap-2 text-sm font-black text-charcoal">
              <Clock aria-hidden className="h-4 w-4" />
              Pickup time
            </span>
            <select
              value={pickupTime}
              onChange={(event) => setPickupTime(event.target.value)}
              className="h-12 w-full rounded border border-black/10 bg-white px-3 text-sm font-bold"
            >
              {slotOptions.map((slot) => (
                <option key={slot}>{slot}</option>
              ))}
            </select>
          </label>
          <div className="mb-5 grid gap-3">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-charcoal">Name</span>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="h-11 w-full rounded border border-black/10 px-3 text-sm font-bold"
                autoComplete="name"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-charcoal">Email</span>
                <input
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="h-11 w-full rounded border border-black/10 px-3 text-sm font-bold"
                  type="email"
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-charcoal">Phone</span>
                <input
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="h-11 w-full rounded border border-black/10 px-3 text-sm font-bold"
                  type="tel"
                  autoComplete="tel"
                />
              </label>
            </div>
          </div>
          <div className="grid gap-3">
            {lines.length === 0 ? (
              <p className="rounded bg-smoke p-4 text-sm font-semibold text-charcoal/65">Choose dishes to start your order.</p>
            ) : (
              lines.map((line) => (
                <div
                  key={line.id}
                  className={cn(
                    "rounded border p-3 transition duration-200",
                    addedFeedback?.id === line.id ? "border-leaf/35 bg-leaf/5" : "border-black/8 bg-white",
                  )}
                >
                  <div className="flex justify-between gap-3">
                    <h3 className="text-sm font-black text-ink">{line.name}</h3>
                    <button type="button" onClick={() => removeItem(line.id)} aria-label={`Remove ${line.name}`}>
                      <Trash2 aria-hidden className="h-4 w-4 text-charcoal/45" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setQuantity(line.id, line.quantity - 1)} className="grid h-8 w-8 place-items-center rounded bg-smoke" aria-label="Decrease quantity">
                        <Minus aria-hidden className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-black">{line.quantity}</span>
                      <button type="button" onClick={() => setQuantity(line.id, line.quantity + 1)} className="grid h-8 w-8 place-items-center rounded bg-smoke" aria-label="Increase quantity">
                        <Plus aria-hidden className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-black text-burgundy-700">{formatCurrency(line.price * line.quantity)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <dl className="mt-5 grid gap-2 border-t border-black/8 pt-5 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-bold">{totals.displaySubtotal}</dd>
            </div>
            <div className="flex justify-between text-charcoal/62">
              <dt>GST included</dt>
              <dd>{totals.displayGst}</dd>
            </div>
            <div className="flex justify-between text-lg font-black">
              <dt>Total</dt>
              <dd>{totals.displayTotal}</dd>
            </div>
          </dl>
          <button
            type="button"
            disabled={lines.length === 0 || loading}
            onClick={checkout}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white transition hover:bg-burgundy-700 disabled:cursor-not-allowed disabled:bg-charcoal/25"
          >
            <CreditCard aria-hidden className="h-4 w-4" />
            {loading ? "Opening checkout..." : "Pay Online"}
          </button>
          <p className="mt-3 text-xs leading-5 text-charcoal/55">
            Stripe Checkout is used when `STRIPE_SECRET_KEY` is configured. Local development returns a demo success link.
          </p>
          <a href={RESTAURANT_CONFIG.orderingLink} target="_blank" rel="noreferrer" className="mt-4 block text-center text-sm font-black text-burgundy-700">
            Prefer delivery? Order via DoorDash
          </a>
        </div>
      </aside>
    </div>
  );
}
