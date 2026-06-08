"use client";

import { useEffect, useMemo, useState } from "react";

import { StatusTracker } from "@/components/ui";

const statusIndex: Record<string, number> = {
  RECEIVED: 0,
  CONFIRMED: 0,
  BEING_PREPARED: 1,
  READY_FOR_PICKUP: 2,
  COMPLETED: 2,
};

export function OrderSuccessStatus({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState("RECEIVED");

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`);
      const data = (await response.json()) as { status?: string };
      if (active && data.status) {
        setStatus(data.status);
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
    </div>
  );
}
