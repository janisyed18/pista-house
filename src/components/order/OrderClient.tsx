"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, CreditCard, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { DietaryBadge, FoodTypeIndicator } from "@/components/ui";
import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { requestCheckoutUrl } from "@/lib/checkout-client";
import { formatCurrency } from "@/lib/hours";
import type { MergedMenuCategory, MergedMenuItem } from "@/lib/menu";
import { calculateOrderTotals, formatCartLineCustomization, menuItemToCartLine, SPICE_LEVELS, type SpiceLevel } from "@/lib/order";
import { getCartUpsellSuggestions } from "@/lib/order-upsells";
import type { OrderingPauseStatus } from "@/lib/ordering-pause-shared";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

const slotOptions = ["ASAP", "12:30", "13:00", "13:30", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
const maxDraftQuantity = 20;

type ItemDraft = {
  quantity: number;
  spiceLevel: SpiceLevel;
  notes: string;
};

const defaultDraft: ItemDraft = {
  quantity: 1,
  spiceLevel: "Medium",
  notes: "",
};

export function OrderClient({ menuCategories, orderingPause }: { menuCategories: MergedMenuCategory[]; orderingPause: OrderingPauseStatus }) {
  const searchParams = useSearchParams();
  const initialCategory = menuCategories.some((group) => group.slug === "plates") ? "plates" : (menuCategories[0]?.slug ?? "all");
  const [category, setCategory] = useState(initialCategory);
  const [pickupTime, setPickupTime] = useState("ASAP");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [addedFeedback, setAddedFeedback] = useState<{ itemId: string; lineId: string; name: string; quantity: number } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ItemDraft>>({});
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lines = useCartStore((state) => state.lines);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const totals = useMemo(() => calculateOrderTotals(lines), [lines]);
  const allMenuItems = useMemo(() => menuCategories.flatMap((group) => group.items), [menuCategories]);
  const upsellSuggestions = useMemo(() => getCartUpsellSuggestions(lines, allMenuItems), [allMenuItems, lines]);

  useEffect(() => {
    const item = searchParams.get("item");
    if (item) {
      const menuItem = menuCategories.flatMap((group) => group.items).find((entry) => entry.id === item);
      if (menuItem?.available) {
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

  function getDraft(itemId: string) {
    return drafts[itemId] ?? defaultDraft;
  }

  function updateDraft(itemId: string, patch: Partial<ItemDraft>) {
    setDrafts((current) => {
      const nextDraft = { ...(current[itemId] ?? defaultDraft), ...patch };
      return {
        ...current,
        [itemId]: {
          ...nextDraft,
          quantity: Math.min(maxDraftQuantity, Math.max(1, nextDraft.quantity)),
          notes: nextDraft.notes.slice(0, 120),
        },
      };
    });
  }

  function addMenuItem(item: MergedMenuItem) {
    if (!item.available) {
      return;
    }

    const draft = getDraft(item.id);
    const line = menuItemToCartLine(item, draft.quantity, {
      spiceLevel: allowsSpiceSelection(item) ? draft.spiceLevel : undefined,
      notes: draft.notes,
    });

    addItem(line);
    setAddedFeedback({ itemId: item.id, lineId: line.id, name: item.name, quantity: draft.quantity });
    updateDraft(item.id, { quantity: 1, notes: "" });
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => setAddedFeedback(null), 1400);
  }

  function addUpsellSuggestion(item: MergedMenuItem) {
    if (!item.available) {
      return;
    }

    const line = menuItemToCartLine(item);
    addItem(line);
    setAddedFeedback({ itemId: item.id, lineId: line.id, name: item.name, quantity: 1 });
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => setAddedFeedback(null), 1400);
  }

  async function checkout() {
    if (orderingPause.paused) {
      setCheckoutError(orderingPause.message);
      return;
    }

    setLoading(true);
    setCheckoutError("");

    try {
      const url = await requestCheckoutUrl({ lines, pickupTime, customerName, customerEmail, customerPhone });
      window.location.href = url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout is temporarily unavailable. Please try again or call the restaurant.");
      setLoading(false);
    }
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
        {orderingPause.paused ? (
          <div className="mb-5 rounded border border-burgundy-700/20 bg-burgundy-50 p-4">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-burgundy-700">Online ordering paused</p>
            <p className="mt-2 text-base font-bold leading-7 text-charcoal">{orderingPause.message}</p>
            {orderingPause.pausedUntil ? (
              <p className="mt-2 text-sm font-bold text-charcoal/60">
                Expected back {new Date(orderingPause.pausedUntil).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            ) : null}
            <a href={`tel:${RESTAURANT_CONFIG.phone.replace(/\s/g, "")}`} className="mt-3 inline-flex rounded bg-burgundy-900 px-4 py-2 text-sm font-black text-white">
              Call the restaurant
            </a>
          </div>
        ) : null}
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
          {activeItems.map((item, index) => {
            const draft = getDraft(item.id);
            const itemAllowsSpice = allowsSpiceSelection(item);
            const isAdded = addedFeedback?.itemId === item.id;
            const isAvailable = item.available;

            return (
              <article
                key={item.id}
                className={cn(
                  "grid min-w-0 gap-4 rounded border bg-white p-3 shadow-sm transition duration-200 sm:grid-cols-[128px_minmax(0,1fr)]",
                  isAdded ? "border-leaf/55 ring-2 ring-leaf/20" : "border-black/8",
                  !isAvailable && "bg-white/80 opacity-90",
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
                  {!isAvailable ? (
                    <div className="absolute inset-0 grid place-items-center bg-charcoal/58">
                      <span className="rounded bg-white px-3 py-1 text-xs font-black text-burgundy-900">Sold out</span>
                    </div>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="min-w-0 break-words font-black leading-tight text-ink">{item.name}</h2>
                      {!isAvailable ? (
                        <p className="mt-1 w-fit rounded bg-red-50 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-red-700">
                          Sold out today
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 whitespace-nowrap font-black text-burgundy-700">{formatCurrency(item.price)}</p>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-charcoal/65">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <FoodTypeIndicator tags={item.dietaryTags} />
                    {item.dietaryTags.map((tag) => (
                      <DietaryBadge key={tag} tag={tag} label="full" />
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 border-t border-black/8 pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-charcoal/48">Quantity</p>
                        <div className="mt-1 inline-flex items-center rounded border border-black/10 bg-white">
                          <button
                            type="button"
                            onClick={() => updateDraft(item.id, { quantity: draft.quantity - 1 })}
                            disabled={!isAvailable}
                            className="grid h-9 w-9 place-items-center text-charcoal transition hover:bg-smoke"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus aria-hidden className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-black">{draft.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateDraft(item.id, { quantity: draft.quantity + 1 })}
                            disabled={!isAvailable}
                            className="grid h-9 w-9 place-items-center text-charcoal transition hover:bg-smoke"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus aria-hidden className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addMenuItem(item)}
                        disabled={isAdded || !isAvailable}
                        className={cn(
                          "inline-flex min-h-10 min-w-[112px] items-center justify-center gap-2 rounded px-3 py-2 text-xs font-black text-white transition disabled:cursor-default",
                          isAdded ? "bg-leaf shadow-[0_0_0_4px_rgba(38,118,90,0.14)]" : "bg-burgundy-900 hover:bg-burgundy-700",
                          !isAvailable && "bg-charcoal/25 text-charcoal/60",
                        )}
                      >
                        {isAdded ? <CheckCircle2 aria-hidden className="h-3.5 w-3.5" /> : <Plus aria-hidden className="h-3.5 w-3.5" />}
                        {!isAvailable ? "Sold out" : isAdded ? "Added" : `Add ${draft.quantity}`}
                      </button>
                    </div>
                    {itemAllowsSpice ? (
                      <fieldset>
                        <legend className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-charcoal/48">Spice level</legend>
                        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 2xl:grid-cols-2">
                          {SPICE_LEVELS.map((level) => (
                            <button
                              key={level}
                              type="button"
                              aria-pressed={draft.spiceLevel === level}
                              onClick={() => updateDraft(item.id, { spiceLevel: level })}
                              disabled={!isAvailable}
                              className={cn(
                                "min-h-9 rounded border px-2 text-xs font-black transition",
                                draft.spiceLevel === level ? "border-burgundy-900 bg-burgundy-900 text-white" : "border-black/10 bg-white text-charcoal hover:border-burgundy-700/40",
                                !isAvailable && "cursor-not-allowed opacity-50",
                              )}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    ) : null}
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.14em] text-charcoal/48">Chef notes</span>
                      <input
                        value={draft.notes}
                        onChange={(event) => updateDraft(item.id, { notes: event.target.value })}
                        disabled={!isAvailable}
                        placeholder="No onion, extra raita, allergy note"
                        maxLength={120}
                        className="h-10 w-full rounded border border-black/10 px-3 text-sm font-bold outline-none transition placeholder:text-charcoal/35 focus:border-burgundy-700 focus:ring-2 focus:ring-burgundy-700/15"
                      />
                    </label>
                  </div>
                </div>
              </article>
            );
          })}
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
                Added {addedFeedback.quantity} x {addedFeedback.name} to your order
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
                    addedFeedback?.lineId === line.id ? "border-leaf/35 bg-leaf/5" : "border-black/8 bg-white",
                  )}
                >
                  <div className="flex justify-between gap-3">
                    <h3 className="text-sm font-black text-ink">{line.name}</h3>
                    <button type="button" onClick={() => removeItem(line.id)} aria-label={`Remove ${line.name}`}>
                      <Trash2 aria-hidden className="h-4 w-4 text-charcoal/45" />
                    </button>
                  </div>
                  {formatCartLineCustomization(line) ? (
                    <p className="mt-2 text-xs font-bold leading-5 text-burgundy-700">{formatCartLineCustomization(line)}</p>
                  ) : null}
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
          {upsellSuggestions.length ? (
            <div className="mt-5 rounded border border-saffron-700/15 bg-saffron-50/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-ink">Complete your meal</h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-charcoal/58">Add a drink, dessert or biryani side.</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                {upsellSuggestions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded bg-white p-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-black text-ink">{item.name}</p>
                      <p className="text-xs font-bold text-burgundy-700">{formatCurrency(item.price)}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Add ${item.name} to order`}
                      onClick={() => addUpsellSuggestion(item)}
                      disabled={!item.available}
                      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded bg-burgundy-900 px-3 text-xs font-black text-white transition hover:bg-burgundy-700"
                    >
                      <Plus aria-hidden className="h-3.5 w-3.5" />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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
            disabled={lines.length === 0 || loading || orderingPause.paused}
            onClick={checkout}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white transition hover:bg-burgundy-700 disabled:cursor-not-allowed disabled:bg-charcoal/25"
          >
            <CreditCard aria-hidden className="h-4 w-4" />
            {orderingPause.paused ? "Ordering Paused" : loading ? "Opening checkout..." : "Pay Online"}
          </button>
          <p className="mt-3 text-xs leading-5 text-charcoal/55">
            Promo codes can be entered securely in Stripe Checkout. Local development returns a demo success link when Stripe is not configured.
          </p>
          {checkoutError ? <p className="mt-3 rounded border border-burgundy-700/20 bg-burgundy-50 p-3 text-sm font-bold text-burgundy-700">{checkoutError}</p> : null}
          <a href={RESTAURANT_CONFIG.orderingLink} target="_blank" rel="noreferrer" className="mt-4 block text-center text-sm font-black text-burgundy-700">
            Prefer delivery? Order via DoorDash
          </a>
        </div>
      </aside>
    </div>
  );
}

function allowsSpiceSelection(item: MergedMenuItem) {
  return item.dietaryTags.includes("S");
}
