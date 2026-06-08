"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded border border-black/8 bg-white p-5 shadow-lift">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 text-sm font-black">Name</span>
          <input name="name" className="h-12 w-full rounded border border-black/10 px-3" required />
        </label>
        <label className="block">
          <span className="mb-2 text-sm font-black">Email</span>
          <input name="email" type="email" className="h-12 w-full rounded border border-black/10 px-3" required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 text-sm font-black">Phone</span>
          <input name="phone" className="h-12 w-full rounded border border-black/10 px-3" />
        </label>
        <label className="block">
          <span className="mb-2 text-sm font-black">Subject</span>
          <select name="subject" className="h-12 w-full rounded border border-black/10 px-3">
            {["General enquiry", "Catering", "Reservation", "Feedback", "Media"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-2 text-sm font-black">Message</span>
        <textarea name="message" rows={6} className="w-full rounded border border-black/10 p-3" required />
      </label>
      {sent ? <p className="rounded bg-leaf/10 p-3 text-sm font-bold text-leaf">Message sent. The restaurant has been notified.</p> : null}
      <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-burgundy-900 px-5 py-3 text-sm font-black text-white">
        <Send aria-hidden className="h-4 w-4" />
        Send Message
      </button>
    </form>
  );
}
