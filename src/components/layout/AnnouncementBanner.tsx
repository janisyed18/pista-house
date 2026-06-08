"use client";

import { Megaphone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  message: string;
};

export function AnnouncementBanner() {
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let active = true;

    async function loadAnnouncements() {
      const response = await fetch(`/api/announcements/active?path=${encodeURIComponent(pathname)}`);
      const data = (await response.json()) as { announcements?: Announcement[] };
      if (active) {
        setAnnouncements(data.announcements ?? []);
      }
    }

    void loadAnnouncements();

    return () => {
      active = false;
    };
  }, [pathname]);

  if (announcements.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-saffron-300/25 bg-burgundy-900 text-white">
      <div className="container flex min-h-11 items-center gap-3 py-2 text-sm font-bold">
        <Megaphone aria-hidden className="h-4 w-4 text-saffron-300" />
        <span className="font-black text-saffron-100">{announcements[0].title}</span>
        <span className="text-white/82">{announcements[0].message}</span>
      </div>
    </div>
  );
}
