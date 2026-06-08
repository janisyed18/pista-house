"use client";

import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { RESTAURANT_CONFIG } from "@/config/restaurant";
import { generateReservationSlots } from "@/lib/reservations";

const today = new Date().toISOString().slice(0, 10);

export function ReservationForm() {
  const [step, setStep] = useState(1);
  const [submittedId, setSubmittedId] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);
  const [form, setForm] = useState({
    date: today,
    time: "",
    partySize: "2",
    name: "",
    phone: "",
    email: "",
    occasion: "Dinner",
    guestNotes: "",
    smsOptIn: false,
  });

  const slots = useMemo(() => generateReservationSlots(form.date, RESTAURANT_CONFIG.hours), [form.date]);
  const visibleSlots = availabilityLoaded ? availableSlots : slots;
  const selectedTime = form.time && visibleSlots.includes(form.time) ? form.time : visibleSlots[0] || "";

  useEffect(() => {
    let active = true;
    setAvailabilityLoaded(false);

    async function loadAvailability() {
      const response = await fetch(`/api/reservations/availability?date=${encodeURIComponent(form.date)}&partySize=${encodeURIComponent(form.partySize)}`);
      const data = (await response.json()) as { slots?: string[] };
      if (active) {
        setAvailableSlots(data.slots ?? []);
        setAvailabilityLoaded(true);
      }
    }

    void loadAvailability();

    return () => {
      active = false;
    };
  }, [form.date, form.partySize]);

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, time: selectedTime, partySize: Number(form.partySize) };
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setSubmittedId(data.id ?? "booking-demo");
    setStep(4);
  }

  return (
    <form onSubmit={submit} className="rounded border border-black/8 bg-white p-5 shadow-lift">
      <div className="mb-6 flex items-center gap-2" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((item) => (
          <span key={item} className={`h-2 flex-1 rounded ${item <= step ? "bg-burgundy-900" : "bg-smoke"}`} />
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-5">
          <h2 className="text-2xl font-black text-ink">Choose date, time and party size</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-black">
                <CalendarDays aria-hidden className="h-4 w-4" />
                Date
              </span>
              <input type="date" min={today} value={form.date} onChange={(event) => update("date", event.target.value)} className="h-12 w-full rounded border border-black/10 px-3 font-bold" required />
            </label>
            <label className="block">
              <span className="mb-2 text-sm font-black">Time</span>
              <select value={selectedTime} onChange={(event) => update("time", event.target.value)} className="h-12 w-full rounded border border-black/10 px-3 font-bold" required>
                {visibleSlots.length ? (
                  visibleSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))
                ) : (
                  <option value="">No tables available</option>
                )}
              </select>
              {availabilityLoaded && !visibleSlots.length ? <p className="mt-2 text-xs font-bold text-burgundy-700">This date is fully booked for the selected party size.</p> : null}
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-black">
                <Users aria-hidden className="h-4 w-4" />
                Party
              </span>
              <select value={form.partySize} onChange={(event) => update("partySize", event.target.value)} className="h-12 w-full rounded border border-black/10 px-3 font-bold">
                {Array.from({ length: 14 }, (_, index) => index + 1).map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-5">
          <h2 className="text-2xl font-black text-ink">Guest details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 text-sm font-black">Name</span>
              <input value={form.name} onChange={(event) => update("name", event.target.value)} className="h-12 w-full rounded border border-black/10 px-3" required />
            </label>
            <label className="block">
              <span className="mb-2 text-sm font-black">Phone</span>
              <input value={form.phone} onChange={(event) => update("phone", event.target.value)} className="h-12 w-full rounded border border-black/10 px-3" required />
            </label>
            <label className="block">
              <span className="mb-2 text-sm font-black">Email</span>
              <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="h-12 w-full rounded border border-black/10 px-3" required />
            </label>
            <label className="block">
              <span className="mb-2 text-sm font-black">Occasion</span>
              <select value={form.occasion} onChange={(event) => update("occasion", event.target.value)} className="h-12 w-full rounded border border-black/10 px-3">
                {["Dinner", "Birthday", "Family gathering", "Business meal", "Catering discussion"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-2 text-sm font-black">Seating requests</span>
            <textarea
              value={form.guestNotes}
              onChange={(event) => update("guestNotes", event.target.value)}
              rows={3}
              placeholder="Quiet table, birthday, high chair, accessibility needs..."
              className="w-full rounded border border-black/10 p-3"
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-bold text-charcoal/72">
            <input type="checkbox" checked={form.smsOptIn} onChange={(event) => update("smsOptIn", event.target.checked)} className="h-5 w-5" />
            Send SMS confirmation when Twilio is configured
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-5">
          <h2 className="text-2xl font-black text-ink">Confirm reservation</h2>
          <dl className="grid gap-3 rounded bg-smoke p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-charcoal/60">Date</dt>
              <dd className="font-black">{form.date}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-charcoal/60">Time</dt>
              <dd className="font-black">{selectedTime}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-charcoal/60">Party</dt>
              <dd className="font-black">{form.partySize}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-bold text-charcoal/60">Name</dt>
              <dd className="font-black">{form.name}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="py-8 text-center">
          <CheckCircle2 aria-hidden className="mx-auto h-12 w-12 text-leaf" />
          <h2 className="mt-4 text-3xl font-black">Reservation requested</h2>
          <p className="mt-2 text-charcoal/68">Confirmation ID: {submittedId}</p>
        </div>
      ) : null}

      {step < 4 ? (
        <div className="mt-8 flex justify-between gap-3">
          <button type="button" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1} className="inline-flex min-h-12 items-center gap-2 rounded border border-black/10 px-5 py-3 text-sm font-black disabled:opacity-40">
            <ChevronLeft aria-hidden className="h-4 w-4" />
            Back
          </button>
          {step < 3 ? (
            <button type="button" onClick={() => setStep((value) => value + 1)} disabled={step === 1 && !selectedTime} className="inline-flex min-h-12 items-center gap-2 rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white disabled:bg-charcoal/25">
              Next
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" className="inline-flex min-h-12 items-center rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white">
              Confirm Booking
            </button>
          )}
        </div>
      ) : null}
    </form>
  );
}
