import type { DiningTable } from "@prisma/client";

export type AdminTable = ReturnType<typeof serializeAdminTable>;

export function serializeAdminTable(table: DiningTable) {
  return {
    id: table.id,
    name: table.name,
    capacity: table.capacity,
    section: table.section,
    x: table.x,
    y: table.y,
    active: table.active,
    sortOrder: table.sortOrder,
    createdAt: table.createdAt.toISOString(),
    updatedAt: table.updatedAt.toISOString(),
  };
}

export function demoAdminTables() {
  const now = new Date().toISOString();
  return [
    { id: "demo-t2-a", name: "T2 Window", capacity: 2, section: "Front", x: 18, y: 24, active: true, sortOrder: 1, createdAt: now, updatedAt: now },
    { id: "demo-t4-a", name: "T4 Family", capacity: 4, section: "Main", x: 48, y: 42, active: true, sortOrder: 2, createdAt: now, updatedAt: now },
    { id: "demo-t6-a", name: "T6 Booth", capacity: 6, section: "Back", x: 72, y: 64, active: true, sortOrder: 3, createdAt: now, updatedAt: now },
  ];
}
