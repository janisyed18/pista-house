import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { OrderSuccessStatus } from "@/components/order/OrderSuccessStatus";

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string; order_id?: string };
}) {
  const orderId = searchParams.order_id ?? searchParams.session_id ?? "demo-order";

  return (
    <section className="spice-texture min-h-[70vh] py-16 text-white">
      <div className="container">
        <div className="mx-auto max-w-3xl rounded border border-white/15 bg-white p-6 text-ink shadow-lift">
          <div className="flex items-center gap-3">
            <CheckCircle2 aria-hidden className="h-9 w-9 text-leaf" />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-burgundy-700">Payment received</p>
              <h1 className="font-display text-5xl font-bold text-ink">Order Confirmed</h1>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="rounded border border-black/8 p-4">
              <QRCodeSVG value={orderId} size={170} includeMargin />
            </div>
            <div>
              <p className="text-sm font-bold text-charcoal/62">Order ID</p>
              <p className="mt-1 break-all text-xl font-black text-burgundy-700">{orderId}</p>
              <p className="mt-4 text-sm leading-6 text-charcoal/68">Show this QR code at pickup.</p>
            </div>
          </div>
          <OrderSuccessStatus orderId={orderId} />
          <Link href="/menu" className="mt-6 inline-flex rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white">
            Back to menu
          </Link>
        </div>
      </div>
    </section>
  );
}
