"use client";

import Link from "next/link";
import { ArrowLeft, Bell, CheckCircle2, Clock, Loader2, Maximize2, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildKitchenColumns, getKitchenOrderAction, kitchenLaneLabels, type KitchenBoardOrder, type KitchenLane, type KitchenOrder } from "@/lib/kitchen-display";
import type { AdminOrderStatus } from "@/lib/order-admin";
import { cn } from "@/lib/utils";

type OrdersResponse = {
  orders: KitchenOrder[];
  demo?: boolean;
};

const laneOrder: KitchenLane[] = ["new", "preparing", "ready"];

const urgencyStyles: Record<KitchenBoardOrder["urgency"], string> = {
  normal: "border-emerald-300 bg-emerald-50 text-emerald-900",
  warning: "border-saffron-300 bg-saffron-100 text-burgundy-900",
  late: "border-red-300 bg-red-50 text-red-800",
};

const laneStyles: Record<KitchenLane, string> = {
  new: "border-saffron-300/50 bg-saffron-100/50",
  preparing: "border-blue-300/50 bg-blue-50",
  ready: "border-emerald-300/60 bg-emerald-50",
};

export function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [newOrderFlash, setNewOrderFlash] = useState(false);
  const [demo, setDemo] = useState(false);
  const seenOrderIds = useRef<Set<string> | null>(null);

  const columns = useMemo(() => buildKitchenColumns(orders, now), [orders, now]);
  const activeCount = laneOrder.reduce((total, lane) => total + columns[lane].orders.length, 0);
  const lateCount = laneOrder.reduce((total, lane) => total + columns[lane].orders.filter((order) => order.urgency === "late").length, 0);

  const loadOrders = useCallback(async ({ quiet = false }: { quiet?: boolean } = {}) => {
    if (!quiet) {
      setLoading(true);
    }

    try {
      const data = await fetchJson<OrdersResponse>("/api/admin/orders");
      const activeIds = new Set(data.orders.map((order) => order.id));
      const previousIds = seenOrderIds.current;

      if (previousIds && data.orders.some((order) => !previousIds.has(order.id) && (order.status === "RECEIVED" || order.status === "CONFIRMED"))) {
        setNewOrderFlash(true);
        window.setTimeout(() => setNewOrderFlash(false), 1800);
        if (soundEnabled) {
          playKitchenBell();
        }
      }

      seenOrderIds.current = activeIds;
      setOrders(data.orders);
      setDemo(Boolean(data.demo));
      setMessage(quiet ? "" : "Kitchen board updated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load kitchen orders");
    } finally {
      setLoading(false);
    }
  }, [soundEnabled]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadOrders({ quiet: true });
    }, 10000);
    return () => window.clearInterval(timer);
  }, [loadOrders]);

  async function updateOrderStatus(order: KitchenOrder, status: AdminOrderStatus) {
    setBusy(order.id);
    try {
      const data = await fetchJson<{ order: KitchenOrder }>(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((item) => (item.id === data.order.id ? data.order : item)));
      setMessage(`${data.order.id} moved to ${statusLabel(data.order.status)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order update failed");
    } finally {
      setBusy(null);
    }
  }

  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      setMessage("Fullscreen is unavailable in this browser");
    }
  }

  return (
    <section className={cn("min-h-screen bg-[#17100f] p-3 text-white md:p-5", newOrderFlash ? "ring-4 ring-saffron-300" : "")}>
      <header className="mb-4 grid gap-3 rounded border border-white/10 bg-white/[0.06] p-4 shadow-2xl md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Link href="/admin" className="inline-flex min-h-10 items-center gap-2 rounded border border-white/12 px-3 text-sm font-black text-white/84">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Admin
            </Link>
            <span className="rounded bg-saffron-300 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-burgundy-900">Kitchen display</span>
            {demo ? <span className="rounded border border-saffron-300/40 px-3 py-2 text-xs font-black text-saffron-100">Demo data</span> : null}
          </div>
          <h1 className="font-display text-4xl font-bold leading-none md:text-6xl">Live Orders</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Metric label="Active" value={activeCount.toString()} />
          <Metric label="Late" value={lateCount.toString()} tone={lateCount ? "alert" : "normal"} />
          <div className="inline-flex min-h-12 items-center gap-2 rounded border border-white/10 px-3 text-sm font-black text-white/80">
            <Clock aria-hidden className="h-4 w-4 text-saffron-200" />
            {now.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <button type="button" onClick={() => setSoundEnabled((value) => !value)} className="inline-flex min-h-12 items-center gap-2 rounded border border-white/10 px-3 text-sm font-black text-white/84">
            {soundEnabled ? <Volume2 aria-hidden className="h-4 w-4" /> : <VolumeX aria-hidden className="h-4 w-4" />}
            Sound
          </button>
          <button type="button" onClick={enterFullscreen} className="inline-flex min-h-12 items-center gap-2 rounded border border-white/10 px-3 text-sm font-black text-white/84">
            <Maximize2 aria-hidden className="h-4 w-4" />
            Fullscreen
          </button>
          <button type="button" onClick={() => loadOrders()} className="inline-flex min-h-12 items-center gap-2 rounded bg-saffron-300 px-4 text-sm font-black text-burgundy-900">
            {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <RefreshCw aria-hidden className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </header>

      {message ? (
        <p className="mb-4 rounded border border-saffron-300/30 bg-saffron-200/10 px-4 py-3 text-sm font-black text-saffron-100" role="status">
          {message}
        </p>
      ) : null}

      {newOrderFlash ? (
        <div className="mb-4 flex items-center gap-3 rounded bg-saffron-300 px-4 py-3 text-sm font-black text-burgundy-900">
          <Bell aria-hidden className="h-5 w-5" />
          New order received
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {laneOrder.map((lane) => (
          <section key={lane} className={cn("min-h-[64vh] rounded border p-3", laneStyles[lane])}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-white">{kitchenLaneLabels[lane]}</h2>
              <span className="rounded bg-white px-3 py-1 text-sm font-black text-charcoal">{columns[lane].orders.length}</span>
            </div>
            <div className="grid gap-3">
              {columns[lane].orders.length ? (
                columns[lane].orders.map((order) => (
                  <KitchenTicket key={order.id} order={order} busy={busy === order.id} onStatus={updateOrderStatus} />
                ))
              ) : (
                <div className="rounded border border-white/15 bg-white/10 p-5 text-center text-sm font-black text-white/68">No tickets</div>
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function KitchenTicket({
  order,
  busy,
  onStatus,
}: {
  order: KitchenBoardOrder;
  busy: boolean;
  onStatus: (order: KitchenOrder, status: AdminOrderStatus) => void;
}) {
  const action = getKitchenOrderAction(order.status);

  return (
    <article className="rounded border border-white/12 bg-white p-4 text-charcoal shadow-2xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-all text-2xl font-black text-ink">{order.id}</p>
          <p className="mt-1 text-sm font-bold text-charcoal/58">{order.customerName ?? order.customerPhone ?? "Pickup customer"}</p>
        </div>
        <span className={cn("shrink-0 rounded border px-3 py-1 text-sm font-black", urgencyStyles[order.urgency])}>{order.ageMinutes}m</span>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
        <TicketStat label="Pickup" value={order.pickupTime} />
        <TicketStat label="Paid" value={order.paymentStatus === "PAID" ? "Yes" : statusLabel(order.paymentStatus)} />
        <TicketStat label="Total" value={order.displayTotal} />
      </div>

      <div className="grid gap-2">
        {order.items.map((item) => (
          <div key={item.id} className="rounded bg-smoke p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-lg font-black text-ink">{item.quantity} x {item.name}</p>
              <p className="text-sm font-black text-burgundy-700">{item.displayLineTotal}</p>
            </div>
            {item.customization ? <p className="mt-1 text-sm font-bold text-burgundy-700">{item.customization}</p> : null}
          </div>
        ))}
      </div>

      {action ? (
        <button
          type="button"
          onClick={() => onStatus(order, action.status)}
          disabled={busy}
          className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded bg-burgundy-900 px-4 text-base font-black text-white disabled:bg-charcoal/30"
        >
          {busy ? <Loader2 aria-hidden className="h-5 w-5 animate-spin" /> : <CheckCircle2 aria-hidden className="h-5 w-5" />}
          {action.label}
        </button>
      ) : null}
    </article>
  );
}

function Metric({ label, value, tone = "normal" }: { label: string; value: string; tone?: "normal" | "alert" }) {
  return (
    <div className={cn("rounded border px-4 py-2", tone === "alert" ? "border-red-300/60 bg-red-500/15" : "border-white/10 bg-white/10")}>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function TicketStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-smoke p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-charcoal/45">{label}</p>
      <p className="truncate text-sm font-black text-ink">{value}</p>
    </div>
  );
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Request failed");
  }

  return data as T;
}

function playKitchenBell() {
  const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;

  if (!AudioContextConstructor) {
    return;
  }

  const context = new AudioContextConstructor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12);
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.28, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.34);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
