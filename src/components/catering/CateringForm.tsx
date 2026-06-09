"use client";

import { CalendarDays, CheckCircle2, Loader2, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ReactNode } from "react";

import { cateringEventTypes, cateringMenuInterests, cateringServiceStyles } from "@/lib/catering";
import { cn } from "@/lib/utils";

export function CateringForm() {
  const [selectedMenus, setSelectedMenus] = useState<string[]>(["Biryani"]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      ...Object.fromEntries(formData),
      guestCount: Number(formData.get("guestCount")),
      menuInterests: selectedMenus,
    };

    const response = await fetch("/api/catering", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setStatus("error");
      setMessage("We could not send the catering request. Please call the restaurant or try again.");
      return;
    }

    setStatus("sent");
    setMessage("Catering request received. Our team will review the details and contact you with menu options and pricing.");
    form.reset();
    setSelectedMenus(["Biryani"]);
  }

  function toggleMenuInterest(item: string) {
    setSelectedMenus((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]);
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded border border-black/8 bg-white p-5 shadow-lift md:p-6">
      <div className="flex items-center gap-3 border-b border-black/8 pb-5">
        <span className="grid h-11 w-11 place-items-center rounded bg-burgundy-900 text-saffron-100">
          <CalendarDays aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-ink">Request a Catering Quote</h2>
          <p className="text-sm leading-6 text-charcoal/62">Tell us the event details. The admin team will see this in Catering.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <input name="name" className={inputClass} required autoComplete="name" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" className={inputClass} required autoComplete="email" />
        </Field>
        <Field label="Phone">
          <input name="phone" type="tel" className={inputClass} autoComplete="tel" />
        </Field>
        <Field label="Suburb / venue">
          <input name="suburb" className={inputClass} placeholder="Parramatta, Blacktown, home, hall" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Event date">
          <input name="eventDate" type="date" className={inputClass} />
        </Field>
        <Field label="Event time">
          <input name="eventTime" type="time" className={inputClass} />
        </Field>
        <Field label="Guests">
          <input name="guestCount" type="number" min={1} max={5000} className={inputClass} required defaultValue={40} />
        </Field>
        <Field label="Budget">
          <input name="budget" className={inputClass} placeholder="$1,500" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Event type">
          <select name="eventType" className={inputClass} defaultValue="Family function">
            {cateringEventTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Service style">
          <select name="serviceStyle" className={inputClass} defaultValue="Delivery">
            {cateringServiceStyles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-black text-charcoal">Menu interests</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {cateringMenuInterests.map((item) => {
            const active = selectedMenus.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => toggleMenuInterest(item)}
                className={cn(
                  "min-h-11 rounded border px-3 text-sm font-black transition",
                  active ? "border-burgundy-900 bg-burgundy-900 text-white" : "border-black/10 bg-white text-charcoal hover:border-burgundy-700/40",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label="Dietary needs">
        <input name="dietaryNeeds" className={inputClass} placeholder="Vegetarian count, allergies, halal requirements, spice preference" />
      </Field>

      <Field label="Event details">
        <textarea
          name="message"
          rows={5}
          className="w-full rounded border border-black/10 p-3 text-sm font-bold outline-none transition placeholder:text-charcoal/35 focus:border-burgundy-700 focus:ring-2 focus:ring-burgundy-700/15"
          placeholder="Tell us what food you want, delivery timing, serving needs, special dishes, and anything else we should know."
          required
        />
      </Field>

      {message ? (
        <p className={cn("rounded p-3 text-sm font-bold", status === "sent" ? "bg-leaf/10 text-leaf" : "bg-burgundy-50 text-burgundy-700")}>
          {status === "sent" ? <CheckCircle2 aria-hidden className="mr-2 inline h-4 w-4" /> : null}
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white transition hover:bg-burgundy-700 disabled:bg-charcoal/25"
      >
        {status === "sending" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Send aria-hidden className="h-4 w-4" />}
        {status === "sending" ? "Sending request..." : "Request Catering Quote"}
      </button>
    </form>
  );
}

const inputClass = "h-12 w-full rounded border border-black/10 bg-white px-3 text-sm font-bold outline-none transition placeholder:text-charcoal/35 focus:border-burgundy-700 focus:ring-2 focus:ring-burgundy-700/15";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-charcoal">{label}</span>
      {children}
    </label>
  );
}
