import type { Announcement } from "@prisma/client";

export type AdminAnnouncement = ReturnType<typeof serializeAdminAnnouncement>;

export function serializeAdminAnnouncement(announcement: Announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    kind: announcement.kind,
    startsAt: announcement.startsAt?.toISOString() ?? null,
    endsAt: announcement.endsAt?.toISOString() ?? null,
    active: announcement.active,
    showOnHome: announcement.showOnHome,
    showOnMenu: announcement.showOnMenu,
    showOnOrder: announcement.showOnOrder,
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: announcement.updatedAt.toISOString(),
  };
}

export function demoAdminAnnouncements() {
  const now = new Date().toISOString();
  return [
    {
      id: "demo-ann-weekend-haleem",
      title: "Weekend Haleem Available",
      message: "Fresh Hyderabadi haleem is available this weekend while stocks last.",
      kind: "special",
      startsAt: null,
      endsAt: null,
      active: true,
      showOnHome: true,
      showOnMenu: true,
      showOnOrder: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
