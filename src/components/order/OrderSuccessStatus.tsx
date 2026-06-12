"use client";

import { useEffect, useMemo, useState } from "react";

import { StatusTracker } from "@/components/ui";
import { requestOrderStatus } from "@/lib/order-status-client";

const statusIndex: Record<string, number> = {
  RECEIVED: 0,
  CONFIRMED: 0,
  BEING_PREPARED: 1,
  READY_FOR_PICKUP: 2,
  COMPLETED: 2,
};

export function OrderSuccessStatus({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState("RECEIVED");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      try {
        const nextStatus = await requestOrderStatus(orderId);
        if (active) {
          setStatus(nextStatus);
          setStatusError("");
        }
      } catch (error) {
        if (active) {
          setStatusError(error instanceof Error ? error.message : "Order status is temporarily unavailable.");
        }
      }
    }

    void loadStatus();
    const timer = window.setInterval(loadStatus, 10_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [orderId]);

  const activeIndex = useMemo(() => statusIndex[status] ?? 0, [status]);

  return (
    <div className="mt-8 rounded bg-ink p-4">
      <StatusTracker activeIndex={activeIndex} />
      <p className="mt-3 text-sm font-black text-saffron-100">Current status: {status.replaceAll("_", " ")}</p>
      {statusError ? <p className="mt-2 text-xs font-bold text-white/60">{statusError} We will keep checking automatically.</p> : null}
    </div>
  );
}
