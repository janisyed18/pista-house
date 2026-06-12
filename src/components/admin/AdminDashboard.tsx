"use client";

import Image from "next/image";
import {
  BarChart3,
  Bell,
  Camera,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ImagePlus,
  Loader2,
  Megaphone,
  MessageSquare,
  Plus,
  QrCode,
  Save,
  Search,
  Send,
  Settings,
  Table2,
  Trash2,
  Upload,
  Utensils,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DietaryBadge } from "@/components/ui";
import { RESTAURANT_CONFIG } from "@/config/restaurant";
import type { DietaryTag } from "@/data/menu";
import type { MergedMenuCategory, MergedMenuItem } from "@/lib/menu";
import { getNextOrderStatuses, type AdminOrderStatus, type AuditRangeKey } from "@/lib/order-admin";
import { getNextBookingStatuses, type AdminBookingStatus } from "@/lib/reservation-admin";
import type { SmsSendResult } from "@/lib/sms";
import { cn } from "@/lib/utils";

type TabId = "orders" | "reservations" | "qr" | "menu" | "tables" | "promotions" | "catering" | "audit" | "settings";

type AdminOrder = {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  pickupTime: string;
  status: AdminOrderStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  displayTotal: string;
  totalCents: number;
  createdAt: string;
  items: Array<{
    id: string;
    menuItemId: string;
    name: string;
    quantity: number;
    displayLineTotal: string;
    spiceLevel: string | null;
    notes: string | null;
    customization: string;
  }>;
};

type AuditMetrics = {
  totalOrders: number;
  paidOrders: number;
  cancelledOrders: number;
  displayGross: string;
  displayGst: string;
  displayAverageOrder: string;
  statusCounts: Record<string, number>;
  paymentStatusCounts: Record<string, number>;
  topItems: Array<{ name: string; quantity: number; displayGross: string }>;
};

type AdminReservation = {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  partySize: number;
  occasion: string | null;
  smsOptIn: boolean;
  status: AdminBookingStatus;
  guestNotes: string | null;
  internalNotes: string | null;
  tags: string[];
  tableId: string | null;
  tableName: string | null;
  tableCapacity: number | null;
  createdAt: string;
  updatedAt: string;
};

type AdminTable = {
  id: string;
  name: string;
  capacity: number;
  section: string | null;
  x: number;
  y: number;
  active: boolean;
  sortOrder: number | null;
};

type AdminAnnouncement = {
  id: string;
  title: string;
  message: string;
  kind: string;
  active: boolean;
  showOnHome: boolean;
  showOnMenu: boolean;
  showOnOrder: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

type AnnouncementFormState = Omit<AdminAnnouncement, "startsAt" | "endsAt"> & {
  startsAt: string;
  endsAt: string;
};

type CateringStatus = "QUOTE_REQUESTED" | "CONTACTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

type AdminCateringEnquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  eventDate: string | null;
  guestCount: number | null;
  status: CateringStatus;
  message: string;
  notes: string | null;
  displayQuote: string | null;
  displayDeposit: string | null;
  quotedAmountCents: number | null;
  depositRequiredCents: number | null;
  depositPaidAt: string | null;
  reminderAt: string | null;
};

type HealthResponse = {
  services: Record<string, boolean>;
};

type MenuFormState = {
  id: string;
  source: "seed" | "custom" | "new";
  categorySlug: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  tags: string;
  visible: boolean;
  popular: boolean;
  weekendOnly: boolean;
};

type GuestMessagePayload = {
  entityType: "order" | "reservation" | "catering";
  entityId: string;
  to: string;
  subject: string;
  message: string;
};

const tabs: Array<{ id: TabId; label: string; icon: typeof ClipboardList }> = [
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "reservations", label: "Reservations", icon: CalendarDays },
  { id: "qr", label: "QR Lookup", icon: QrCode },
  { id: "menu", label: "Menu Editor", icon: Utensils },
  { id: "tables", label: "Tables", icon: Table2 },
  { id: "promotions", label: "Promotions", icon: Megaphone },
  { id: "catering", label: "Catering", icon: Bell },
  { id: "audit", label: "Audit", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const emptyMenuForm: MenuFormState = {
  id: "",
  source: "new",
  categorySlug: "plates",
  name: "",
  price: "",
  description: "",
  imageUrl: "",
  tags: "H",
  visible: true,
  popular: false,
  weekendOnly: false,
};

const statusLabels: Record<AdminOrderStatus, string> = {
  RECEIVED: "Received",
  CONFIRMED: "Confirmed",
  BEING_PREPARED: "Preparing",
  READY_FOR_PICKUP: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const paymentLabels: Record<AdminOrder["paymentStatus"], string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

const bookingStatusLabels: Record<AdminBookingStatus, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

const cateringStatusLabels: Record<CateringStatus, string> = {
  QUOTE_REQUESTED: "Quote requested",
  CONTACTED: "Contacted",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const serviceLabels: Record<string, string> = {
  database: "PostgreSQL",
  stripe: "Stripe Checkout",
  stripeWebhook: "Stripe Webhook",
  cloudinaryUpload: "Image Upload",
  resendEmail: "Email",
  twilioSms: "SMS",
  adminPasswordHash: "Password Hash",
};

function formatOrderStatusMessage(order: AdminOrder, sms?: SmsSendResult) {
  const base = `Order ${order.id} moved to ${statusLabels[order.status]}`;

  if (!sms) {
    return base;
  }

  if (sms.status === "sent") {
    return `${base}. SMS sent to customer.`;
  }

  const reasons: Record<Extract<SmsSendResult, { status: "skipped" }>["reason"], string> = {
    sms_not_configured: "Twilio SMS is not configured",
    missing_phone: "customer phone is missing",
    invalid_phone: "customer phone is not a valid Australian mobile",
    provider_error: "SMS provider returned an error",
  };

  return `${base}. SMS not sent: ${reasons[sms.reason]}.`;
}

export function AdminDashboard() {
  const [active, setActive] = useState<TabId>("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<AdminReservation | null>(null);
  const [tables, setTables] = useState<AdminTable[]>([]);
  const [tableForm, setTableForm] = useState({ id: "", name: "", capacity: "4", section: "Main", x: "50", y: "50", active: true });
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementFormState>({
    id: "",
    title: "Weekend Haleem Available",
    message: "Fresh Hyderabadi haleem is available this weekend while stocks last.",
    kind: "special",
    active: true,
    showOnHome: true,
    showOnMenu: true,
    showOnOrder: true,
    startsAt: "",
    endsAt: "",
  });
  const [cateringEnquiries, setCateringEnquiries] = useState<AdminCateringEnquiry[]>([]);
  const [selectedCatering, setSelectedCatering] = useState<AdminCateringEnquiry | null>(null);
  const [lookupCode, setLookupCode] = useState("");
  const [menuCategories, setMenuCategories] = useState<MergedMenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("plates");
  const [menuForm, setMenuForm] = useState<MenuFormState>(emptyMenuForm);
  const [categoryForm, setCategoryForm] = useState({ slug: "", name: "", visible: true, sortOrder: "" });
  const [auditRange, setAuditRange] = useState<AuditRangeKey>("daily");
  const [auditMetrics, setAuditMetrics] = useState<AuditMetrics | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  const menuItems = useMemo(() => menuCategories.flatMap((category) => category.items), [menuCategories]);
  const activeMenuItems = useMemo(
    () => menuCategories.find((category) => category.slug === selectedCategory)?.items ?? menuItems,
    [menuCategories, menuItems, selectedCategory],
  );

  const loadOrders = useCallback(async () => {
    const data = await fetchJson<{ orders: AdminOrder[] }>("/api/admin/orders");
    setOrders(data.orders);
    setSelectedOrder((current) => current ?? data.orders[0] ?? null);
  }, []);

  const loadReservations = useCallback(async () => {
    const data = await fetchJson<{ reservations: AdminReservation[] }>("/api/admin/reservations");
    setReservations(data.reservations);
    setSelectedReservation((current) => current ?? data.reservations[0] ?? null);
  }, []);

  const loadTables = useCallback(async () => {
    const data = await fetchJson<{ tables: AdminTable[] }>("/api/admin/tables");
    setTables(data.tables);
  }, []);

  const loadAnnouncements = useCallback(async () => {
    const data = await fetchJson<{ announcements: AdminAnnouncement[] }>("/api/admin/announcements");
    setAnnouncements(data.announcements);
  }, []);

  const loadCatering = useCallback(async () => {
    const data = await fetchJson<{ enquiries: AdminCateringEnquiry[] }>("/api/admin/catering");
    setCateringEnquiries(data.enquiries);
    setSelectedCatering((current) => current ?? data.enquiries[0] ?? null);
  }, []);

  const loadMenu = useCallback(async () => {
    const data = await fetchJson<{ categories: MergedMenuCategory[] }>("/api/admin/menu");
    setMenuCategories(data.categories);
    const nextCategory = data.categories.find((category) => category.slug === selectedCategory)?.slug ?? data.categories[0]?.slug ?? "plates";
    setSelectedCategory(nextCategory);
    setMenuForm((current) => ({ ...current, categorySlug: current.categorySlug || nextCategory }));
  }, [selectedCategory]);

  const loadAudit = useCallback(async () => {
    const data = await fetchJson<{ metrics: AuditMetrics }>(`/api/admin/audit?range=${auditRange}`);
    setAuditMetrics(data.metrics);
  }, [auditRange]);

  const loadHealth = useCallback(async () => {
    const data = await fetchJson<HealthResponse>("/api/admin/health");
    setHealth(data);
  }, []);

  useEffect(() => {
    void Promise.all([loadOrders(), loadReservations(), loadTables(), loadAnnouncements(), loadCatering(), loadMenu(), loadAudit(), loadHealth()]).catch((error) => setMessage(error.message));
  }, [loadAnnouncements, loadAudit, loadCatering, loadHealth, loadMenu, loadOrders, loadReservations, loadTables]);

  useEffect(() => {
    return () => stopScanner();
  }, []);

  useEffect(() => {
    setMessage("");
  }, [active]);

  async function refreshAll() {
    setBusy("refresh");
    try {
      await Promise.all([loadOrders(), loadReservations(), loadTables(), loadAnnouncements(), loadCatering(), loadMenu(), loadAudit(), loadHealth()]);
      setMessage("Updated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setBusy(null);
    }
  }

  async function updateOrderStatus(order: AdminOrder, status: AdminOrderStatus) {
    setBusy(`order-${order.id}`);
    try {
      const data = await fetchJson<{ order: AdminOrder; sms?: SmsSendResult }>(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((item) => (item.id === data.order.id ? data.order : item)));
      setSelectedOrder(data.order);
      setMessage(formatOrderStatusMessage(data.order, data.sms));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order update failed");
    } finally {
      setBusy(null);
    }
  }

  async function updateReservationStatus(reservation: AdminReservation, status: AdminBookingStatus) {
    setBusy(`reservation-${reservation.id}`);
    try {
      const data = await fetchJson<{ reservation: AdminReservation }>(`/api/admin/reservations/${reservation.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setReservations((current) => current.map((item) => (item.id === data.reservation.id ? data.reservation : item)));
      setSelectedReservation(data.reservation);
      setMessage(`Reservation ${data.reservation.id} ${bookingStatusLabels[data.reservation.status].toLowerCase()}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reservation update failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveReservationDetails(reservation: AdminReservation) {
    setBusy(`reservation-details-${reservation.id}`);
    try {
      const data = await fetchJson<{ reservation: AdminReservation }>(`/api/admin/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestNotes: reservation.guestNotes ?? "",
          internalNotes: reservation.internalNotes ?? "",
          tags: reservation.tags,
          tableId: reservation.tableId,
        }),
      });
      setReservations((current) => current.map((item) => (item.id === data.reservation.id ? data.reservation : item)));
      setSelectedReservation(data.reservation);
      setMessage("Reservation details saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reservation save failed");
    } finally {
      setBusy(null);
    }
  }

  async function sendGuestMessage(payload: GuestMessagePayload) {
    setBusy(`message-${payload.entityId}`);
    try {
      await fetchJson("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMessage("Guest message sent");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Message failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveTable() {
    setBusy("table-save");
    try {
      const payload = {
        name: tableForm.name,
        capacity: Number(tableForm.capacity),
        section: tableForm.section,
        x: Number(tableForm.x),
        y: Number(tableForm.y),
        active: tableForm.active,
      };
      const isNew = !tableForm.id;
      await fetchJson(isNew ? "/api/admin/tables" : `/api/admin/tables/${tableForm.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadTables();
      setTableForm({ id: "", name: "", capacity: "4", section: "Main", x: "50", y: "50", active: true });
      setMessage(isNew ? "Table added" : "Table saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Table save failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveAnnouncement() {
    setBusy("announcement-save");
    try {
      const isNew = !announcementForm.id;
      await fetchJson(isNew ? "/api/admin/announcements" : `/api/admin/announcements/${announcementForm.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announcementForm),
      });
      await loadAnnouncements();
      setMessage(isNew ? "Announcement published" : "Announcement saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Announcement save failed");
    } finally {
      setBusy(null);
    }
  }

  async function updateCatering(enquiry: AdminCateringEnquiry, status: CateringStatus) {
    setBusy(`catering-${enquiry.id}`);
    try {
      const data = await fetchJson<{ enquiry: AdminCateringEnquiry }>(`/api/admin/catering/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes: enquiry.notes ?? "",
          quotedAmount: enquiry.quotedAmountCents ? enquiry.quotedAmountCents / 100 : null,
          depositRequired: enquiry.depositRequiredCents ? enquiry.depositRequiredCents / 100 : null,
          depositPaid: Boolean(enquiry.depositPaidAt),
          reminderAt: enquiry.reminderAt ?? "",
        }),
      });
      setCateringEnquiries((current) => current.map((item) => (item.id === data.enquiry.id ? data.enquiry : item)));
      setSelectedCatering(data.enquiry);
      setMessage(`Catering enquiry moved to ${cateringStatusLabels[data.enquiry.status]}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Catering update failed");
    } finally {
      setBusy(null);
    }
  }

  async function lookupOrder(code = lookupCode) {
    setBusy("lookup");
    try {
      const data = await fetchJson<{ order: AdminOrder }>(`/api/admin/orders/lookup?code=${encodeURIComponent(code)}`);
      setSelectedOrder(data.order);
      setLookupCode(data.order.id);
      setActive("qr");
      setMessage(`Order ${data.order.id} loaded`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order lookup failed");
    } finally {
      setBusy(null);
    }
  }

  async function startScanner() {
    const detectorConstructor = (window as unknown as {
      BarcodeDetector?: new (options: { formats: string[] }) => { detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
    }).BarcodeDetector;

    if (!detectorConstructor || !navigator.mediaDevices?.getUserMedia) {
      setMessage("QR scanning is unavailable in this browser. Enter the order number manually.");
      return;
    }

    setBusy("scanner");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const detector = new detectorConstructor({ formats: ["qr_code"] });
      setScannerActive(true);
      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current) {
          return;
        }
        const codes = await detector.detect(videoRef.current);
        const code = codes[0]?.rawValue;
        if (code) {
          stopScanner();
          await lookupOrder(code);
        }
      }, 750);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start QR scanner");
    } finally {
      setBusy(null);
    }
  }

  function stopScanner() {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScannerActive(false);
  }

  function selectMenuItem(item: MergedMenuItem) {
    setMenuForm({
      id: item.id,
      source: item.source,
      categorySlug: item.category,
      name: item.name,
      price: item.price.toFixed(2),
      description: item.description,
      imageUrl: item.imageUrl,
      tags: item.dietaryTags.join(", "),
      visible: item.visible,
      popular: item.popular,
      weekendOnly: item.weekendOnly ?? false,
    });
    setSelectedCategory(item.category);
  }

  function newMenuItem() {
    setMenuForm({ ...emptyMenuForm, categorySlug: selectedCategory });
  }

  async function saveMenuItem() {
    setBusy("menu-save");
    try {
      const payload = {
        categorySlug: menuForm.categorySlug,
        name: menuForm.name,
        description: menuForm.description,
        price: Number(menuForm.price),
        imageUrl: menuForm.imageUrl,
        tags: parseTags(menuForm.tags),
        visible: menuForm.visible,
        popular: menuForm.popular,
        weekendOnly: menuForm.weekendOnly,
      };
      const isNew = menuForm.source === "new" || !menuForm.id;
      await fetchJson(isNew ? "/api/admin/menu/items" : `/api/admin/menu/items/${menuForm.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await loadMenu();
      setMessage(isNew ? "Menu item added" : "Menu item saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Menu save failed");
    } finally {
      setBusy(null);
    }
  }

  async function deleteMenuItem() {
    if (!menuForm.id) {
      return;
    }

    setBusy("menu-delete");
    try {
      await fetchJson(`/api/admin/menu/items/${menuForm.id}`, { method: "DELETE" });
      await loadMenu();
      newMenuItem();
      setMessage(menuForm.source === "custom" ? "Menu item removed" : "Menu item hidden");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Menu delete failed");
    } finally {
      setBusy(null);
    }
  }

  async function uploadMenuImage(file: File | null) {
    if (!file) {
      return;
    }

    setBusy("image-upload");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const data = await fetchJson<{ imageUrl: string }>("/api/admin/menu/images", {
        method: "POST",
        body: formData,
      });
      setMenuForm((current) => ({ ...current, imageUrl: data.imageUrl }));
      setMessage("Image uploaded");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveCategory() {
    setBusy("category-save");
    try {
      await fetchJson("/api/admin/menu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: categoryForm.slug || categoryForm.name,
          name: categoryForm.name,
          visible: categoryForm.visible,
          sortOrder: categoryForm.sortOrder ? Number(categoryForm.sortOrder) : null,
        }),
      });
      await loadMenu();
      setCategoryForm({ slug: "", name: "", visible: true, sortOrder: "" });
      setMessage("Category saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Category save failed");
    } finally {
      setBusy(null);
    }
  }

  async function hideSelectedCategory() {
    const category = menuCategories.find((item) => item.slug === selectedCategory);
    if (!category) {
      return;
    }

    setBusy("category-hide");
    try {
      await fetchJson(`/api/admin/menu/categories/${category.slug}`, { method: "DELETE" });
      await loadMenu();
      setMessage("Category hidden");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Category update failed");
    } finally {
      setBusy(null);
    }
  }

  const selectedOrderActions = selectedOrder ? getNextOrderStatuses(selectedOrder.status) : [];

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav className="grid gap-2 lg:sticky lg:top-6 lg:self-start" aria-label="Admin tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded border px-4 py-3 text-left text-sm font-black transition-colors",
              active === tab.id ? "border-burgundy-900 bg-burgundy-900 text-white" : "border-black/8 bg-white text-charcoal",
            )}
          >
            <tab.icon aria-hidden className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="min-w-0 rounded border border-black/8 bg-white p-4 shadow-lift md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-black/8 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-saffron-700">Admin</p>
            <h2 className="text-2xl font-black text-ink">{tabs.find((tab) => tab.id === active)?.label}</h2>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex min-h-10 items-center gap-2 rounded border border-black/10 px-3 text-sm font-black text-charcoal"
          >
            {busy === "refresh" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <CheckCircle2 aria-hidden className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        {message ? (
          <p className="mb-5 rounded border border-saffron-300/40 bg-saffron-100/65 px-4 py-3 text-sm font-bold text-burgundy-900" role="status">
            {message}
          </p>
        ) : null}

        {active === "orders" ? (
          <OrdersPanel orders={orders} selectedOrder={selectedOrder} onSelect={setSelectedOrder} onStatus={updateOrderStatus} onMessage={sendGuestMessage} busy={busy} />
        ) : null}

        {active === "reservations" ? (
          <ReservationsPanel
            reservations={reservations}
            selectedReservation={selectedReservation}
            onSelect={setSelectedReservation}
            onEdit={setSelectedReservation}
            onStatus={updateReservationStatus}
            onSave={saveReservationDetails}
            onMessage={sendGuestMessage}
            tables={tables}
            busy={busy}
          />
        ) : null}

        {active === "qr" ? (
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(460px,1fr)_minmax(380px,440px)]">
            <div className="grid gap-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_132px_120px]">
                <label className="relative block">
                  <span className="sr-only">Order code</span>
                  <Search aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/45" />
                  <input
                    value={lookupCode}
                    onChange={(event) => setLookupCode(event.target.value)}
                    placeholder="PH-... or pasted QR link"
                    className="h-12 w-full rounded border border-black/10 bg-white pl-10 pr-3 text-sm font-bold"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => lookupOrder()}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-burgundy-900 px-4 text-sm font-black text-white"
                >
                  <QrCode aria-hidden className="h-4 w-4" />
                  Lookup
                </button>
                <button
                  type="button"
                  onClick={scannerActive ? stopScanner : startScanner}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded border border-black/10 bg-white px-4 text-sm font-black text-charcoal"
                >
                  <Camera aria-hidden className="h-4 w-4" />
                  {scannerActive ? "Stop" : "Scan"}
                </button>
              </div>
              <div className="relative aspect-[16/9] min-h-[280px] overflow-hidden rounded border border-black/8 bg-charcoal xl:min-h-[340px]">
                <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
                {!scannerActive ? (
                  <div className="absolute inset-0 grid place-items-center text-sm font-black text-white/75">QR scanner</div>
                ) : null}
              </div>
            </div>
            <OrderDetail order={selectedOrder} actions={selectedOrderActions} onStatus={updateOrderStatus} onMessage={sendGuestMessage} busy={busy} />
          </div>
        ) : null}

        {active === "menu" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
            <div className="min-w-0">
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {menuCategories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => setSelectedCategory(category.slug)}
                    className={cn(
                      "shrink-0 rounded px-4 py-2 text-sm font-black",
                      selectedCategory === category.slug ? "bg-burgundy-900 text-white" : "bg-smoke text-charcoal",
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              <div className="mb-4 grid gap-3 rounded border border-black/8 bg-smoke p-3 md:grid-cols-[1fr_1fr_120px_auto_auto]">
                <input
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Category name"
                  className="h-10 rounded border border-black/10 px-3 text-sm font-bold"
                />
                <input
                  value={categoryForm.slug}
                  onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))}
                  placeholder="Slug"
                  className="h-10 rounded border border-black/10 px-3 text-sm font-bold"
                />
                <input
                  value={categoryForm.sortOrder}
                  onChange={(event) => setCategoryForm((current) => ({ ...current, sortOrder: event.target.value }))}
                  placeholder="Order"
                  className="h-10 rounded border border-black/10 px-3 text-sm font-bold"
                  inputMode="numeric"
                />
                <button type="button" onClick={saveCategory} className="inline-flex h-10 items-center justify-center gap-2 rounded bg-burgundy-900 px-3 text-sm font-black text-white">
                  <Plus aria-hidden className="h-4 w-4" />
                  Category
                </button>
                <button type="button" onClick={hideSelectedCategory} className="inline-flex h-10 items-center justify-center gap-2 rounded border border-black/10 px-3 text-sm font-black">
                  <Trash2 aria-hidden className="h-4 w-4" />
                  Hide
                </button>
              </div>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={newMenuItem}
                  className="inline-flex min-h-11 w-fit items-center gap-2 rounded bg-saffron-300 px-4 text-sm font-black text-burgundy-900"
                >
                  <Plus aria-hidden className="h-4 w-4" />
                  New item
                </button>
                {activeMenuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectMenuItem(item)}
                    className={cn(
                      "grid gap-3 rounded border p-3 text-left sm:grid-cols-[88px_minmax(0,1fr)_auto]",
                      menuForm.id === item.id ? "border-burgundy-900 bg-burgundy-50" : "border-black/8 bg-white",
                    )}
                  >
                    <div className="relative aspect-square overflow-hidden rounded bg-smoke">
                      {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill sizes="88px" className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-ink">{item.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-charcoal/64">{item.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.dietaryTags.map((tag) => (
                          <DietaryBadge key={tag} tag={tag} />
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-sm font-black text-burgundy-700">${item.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="xl:sticky xl:top-28 xl:self-start">
              <MenuEditorForm
                form={menuForm}
                categories={menuCategories}
                busy={busy}
                onChange={setMenuForm}
                onSave={saveMenuItem}
                onDelete={deleteMenuItem}
                onUpload={uploadMenuImage}
              />
            </div>
          </div>
        ) : null}

        {active === "tables" ? (
          <TablesPanel tables={tables} form={tableForm} onForm={setTableForm} onSave={saveTable} busy={busy} />
        ) : null}

        {active === "promotions" ? (
          <PromotionsPanel announcements={announcements} form={announcementForm} onForm={setAnnouncementForm} onSave={saveAnnouncement} busy={busy} />
        ) : null}

        {active === "catering" ? (
          <CateringPanel enquiries={cateringEnquiries} selected={selectedCatering} onSelect={setSelectedCatering} onUpdate={updateCatering} onMessage={sendGuestMessage} busy={busy} />
        ) : null}

        {active === "audit" ? (
          <AuditPanel range={auditRange} metrics={auditMetrics} onRange={setAuditRange} />
        ) : null}

        {active === "settings" ? <SettingsPanel health={health} /> : null}
      </section>
    </div>
  );
}

function OrdersPanel({
  orders,
  selectedOrder,
  onSelect,
  onStatus,
  onMessage,
  busy,
}: {
  orders: AdminOrder[];
  selectedOrder: AdminOrder | null;
  onSelect: (order: AdminOrder) => void;
  onStatus: (order: AdminOrder, status: AdminOrderStatus) => void;
  onMessage: (payload: GuestMessagePayload) => void;
  busy: string | null;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              {["Order", "Customer", "Pickup", "Payment", "Status", "Total"].map((header) => (
                <th key={header} className="py-3 pr-4 font-black text-charcoal/62">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-black/8">
                <td className="py-3 pr-4">
                  <button type="button" onClick={() => onSelect(order)} className="font-black text-burgundy-700">
                    {order.id}
                  </button>
                </td>
                <td className="py-3 pr-4 font-bold text-charcoal/78">{order.customerName ?? order.customerPhone ?? "Pickup customer"}</td>
                <td className="py-3 pr-4 font-bold text-charcoal/78">{order.pickupTime}</td>
                <td className="py-3 pr-4">
                  <PaymentBadge status={order.paymentStatus} />
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-3 pr-4 font-black text-ink">{order.displayTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <OrderDetail
        order={selectedOrder}
        actions={selectedOrder ? getNextOrderStatuses(selectedOrder.status) : []}
        onStatus={onStatus}
        onMessage={onMessage}
        busy={busy}
      />
    </div>
  );
}

function ReservationsPanel({
  reservations,
  selectedReservation,
  onSelect,
  onEdit,
  onStatus,
  onSave,
  onMessage,
  tables,
  busy,
}: {
  reservations: AdminReservation[];
  selectedReservation: AdminReservation | null;
  onSelect: (reservation: AdminReservation) => void;
  onEdit: (reservation: AdminReservation) => void;
  onStatus: (reservation: AdminReservation, status: AdminBookingStatus) => void;
  onSave: (reservation: AdminReservation) => void;
  onMessage: (payload: GuestMessagePayload) => void;
  tables: AdminTable[];
  busy: string | null;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              {["Reservation", "Guest", "Date", "Time", "Party", "Status"].map((header) => (
                <th key={header} className="py-3 pr-4 font-black text-charcoal/62">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-b border-black/8">
                <td className="py-3 pr-4">
                  <button type="button" onClick={() => onSelect(reservation)} className="font-black text-burgundy-700">
                    {reservation.id}
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <p className="font-black text-ink">{reservation.name}</p>
                  <p className="text-xs font-bold text-charcoal/55">{reservation.phone}</p>
                </td>
                <td className="py-3 pr-4 font-bold text-charcoal/78">{reservation.date}</td>
                <td className="py-3 pr-4 font-bold text-charcoal/78">{reservation.time}</td>
                <td className="py-3 pr-4 font-bold text-charcoal/78">{reservation.partySize}</td>
                <td className="py-3 pr-4">
                  <BookingStatusBadge status={reservation.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReservationDetail
        reservation={selectedReservation}
        actions={selectedReservation ? getNextBookingStatuses(selectedReservation.status) : []}
        tables={tables}
        onEdit={onEdit}
        onStatus={onStatus}
        onSave={onSave}
        onMessage={onMessage}
        busy={busy}
      />
    </div>
  );
}

function ReservationDetail({
  reservation,
  actions,
  tables,
  onEdit,
  onStatus,
  onSave,
  onMessage,
  busy,
}: {
  reservation: AdminReservation | null;
  actions: AdminBookingStatus[];
  tables: AdminTable[];
  onEdit: (reservation: AdminReservation) => void;
  onStatus: (reservation: AdminReservation, status: AdminBookingStatus) => void;
  onSave: (reservation: AdminReservation) => void;
  onMessage: (payload: GuestMessagePayload) => void;
  busy: string | null;
}) {
  if (!reservation) {
    return <div className="rounded border border-black/8 bg-smoke p-4 text-sm font-bold text-charcoal/65">No reservation selected.</div>;
  }

  return (
    <aside className="rounded border border-black/8 bg-smoke p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-saffron-700">Table reservation</p>
          <h3 className="mt-1 text-2xl font-black text-ink">{reservation.id}</h3>
        </div>
        <BookingStatusBadge status={reservation.status} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Guest</dt>
          <dd className="font-black">{reservation.name}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Date</dt>
          <dd className="font-black">{reservation.date}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Time</dt>
          <dd className="font-black">{reservation.time}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Party</dt>
          <dd className="font-black">{reservation.partySize}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Phone</dt>
          <dd className="font-black">{reservation.phone}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-charcoal/58">Email</dt>
          <dd className="break-all font-black">{reservation.email}</dd>
        </div>
        {reservation.occasion ? (
          <div className="flex justify-between gap-3">
            <dt className="text-charcoal/58">Occasion</dt>
            <dd className="font-black">{reservation.occasion}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Table</dt>
          <dd className="font-black">{reservation.tableName ? `${reservation.tableName} (${reservation.tableCapacity})` : "Unassigned"}</dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-3 rounded bg-white p-3">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-charcoal/50">Guest notes</span>
          <textarea
            value={reservation.guestNotes ?? ""}
            onChange={(event) => onEdit({ ...reservation, guestNotes: event.target.value })}
            className="min-h-20 w-full rounded border border-black/10 p-2 text-sm font-bold"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-charcoal/50">Admin notes</span>
          <textarea
            value={reservation.internalNotes ?? ""}
            onChange={(event) => onEdit({ ...reservation, internalNotes: event.target.value })}
            className="min-h-20 w-full rounded border border-black/10 p-2 text-sm font-bold"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-charcoal/50">Tags</span>
          <input
            value={reservation.tags.join(", ")}
            onChange={(event) => onEdit({ ...reservation, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })}
            className="h-10 w-full rounded border border-black/10 px-2 text-sm font-bold"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-charcoal/50">Assigned table</span>
          <select
            value={reservation.tableId ?? ""}
            onChange={(event) => {
              const table = tables.find((item) => item.id === event.target.value);
              onEdit({ ...reservation, tableId: event.target.value || null, tableName: table?.name ?? null, tableCapacity: table?.capacity ?? null });
            }}
            className="h-10 w-full rounded border border-black/10 bg-white px-2 text-sm font-bold"
          >
            <option value="">Unassigned</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.name} · {table.capacity}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => onSave(reservation)}
          disabled={busy === `reservation-details-${reservation.id}`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded bg-saffron-300 px-3 text-xs font-black text-burgundy-900"
        >
          <Save aria-hidden className="h-3.5 w-3.5" />
          Save notes
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.length ? (
          actions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatus(reservation, status)}
              disabled={busy === `reservation-${reservation.id}`}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded px-3 text-xs font-black disabled:bg-charcoal/25",
                status === "CONFIRMED" ? "bg-leaf text-white" : "bg-burgundy-900 text-white",
              )}
            >
              {busy === `reservation-${reservation.id}` ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : null}
              {bookingStatusLabels[status]}
            </button>
          ))
        ) : (
          <span className="text-sm font-bold text-charcoal/58">No further reservation actions</span>
        )}
      </div>
      <GuestMessageBox
        entityType="reservation"
        entityId={reservation.id}
        to={reservation.email}
        templates={[
          ["Confirm booking", `Your table at Pista House is confirmed for ${reservation.date} at ${reservation.time}.`],
          ["Late arrival", `Hi ${reservation.name}, are you still able to make your ${reservation.time} booking at Pista House?`],
          ["Cancellation notice", `Your Pista House reservation for ${reservation.date} at ${reservation.time} has been cancelled.`],
        ]}
        onMessage={onMessage}
        busy={busy}
      />
    </aside>
  );
}

function OrderDetail({
  order,
  actions,
  onStatus,
  onMessage,
  busy,
}: {
  order: AdminOrder | null;
  actions: AdminOrderStatus[];
  onStatus: (order: AdminOrder, status: AdminOrderStatus) => void;
  onMessage: (payload: GuestMessagePayload) => void;
  busy: string | null;
}) {
  if (!order) {
    return <div className="rounded border border-black/8 bg-smoke p-4 text-sm font-bold text-charcoal/65">No order selected.</div>;
  }

  return (
    <aside className="rounded border border-black/8 bg-smoke p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-saffron-700">Pickup order</p>
          <h3 className="mt-1 text-2xl font-black text-ink">{order.id}</h3>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Payment</dt>
          <dd className="font-black">{paymentLabels[order.paymentStatus]}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Pickup</dt>
          <dd className="font-black">{order.pickupTime}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Customer</dt>
          <dd className="font-black">{order.customerName ?? "Pickup customer"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Phone</dt>
          <dd className="font-black">{order.customerPhone ?? "Not provided"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-charcoal/58">Total</dt>
          <dd className="font-black">{order.displayTotal}</dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded bg-white p-3 text-sm">
            <div>
              <p className="font-black text-ink">{item.quantity} x {item.name}</p>
              <p className="text-charcoal/55">{item.menuItemId}</p>
              {item.customization ? <p className="mt-1 text-xs font-bold text-burgundy-700">{item.customization}</p> : null}
            </div>
            <p className="font-black text-burgundy-700">{item.displayLineTotal}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.length ? (
          actions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatus(order, status)}
              disabled={busy === `order-${order.id}`}
              className="inline-flex min-h-10 items-center gap-2 rounded bg-burgundy-900 px-3 text-xs font-black text-white disabled:bg-charcoal/25"
            >
              {busy === `order-${order.id}` ? <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" /> : null}
              {statusLabels[status]}
            </button>
          ))
        ) : (
          <span className="text-sm font-bold text-charcoal/58">No further status actions</span>
        )}
      </div>
      {order.customerEmail ? (
        <GuestMessageBox
          entityType="order"
          entityId={order.id}
          to={order.customerEmail}
          templates={[
            ["Pickup ready", `Your Pista House pickup order ${order.id} is ready.`],
            ["Order confirmed", `Your Pista House order ${order.id} has been received and is being prepared.`],
            ["Cancellation notice", `Your Pista House order ${order.id} has been cancelled. Please contact us if you have questions.`],
          ]}
          onMessage={onMessage}
          busy={busy}
        />
      ) : null}
    </aside>
  );
}

function MenuEditorForm({
  form,
  categories,
  busy,
  onChange,
  onSave,
  onDelete,
  onUpload,
}: {
  form: MenuFormState;
  categories: MergedMenuCategory[];
  busy: string | null;
  onChange: (form: MenuFormState) => void;
  onSave: () => void;
  onDelete: () => void;
  onUpload: (file: File | null) => void;
}) {
  return (
    <div className="rounded border border-black/8 bg-smoke p-4">
      <div className="mb-4 flex items-center gap-2">
        <ImagePlus aria-hidden className="h-5 w-5 text-burgundy-700" />
        <h3 className="text-xl font-black text-ink">{form.source === "new" ? "New item" : "Edit item"}</h3>
      </div>
      <div className="grid gap-3">
        <label className="block">
          <span className="mb-2 block text-sm font-black">Name</span>
          <input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} className="h-11 w-full rounded border border-black/10 px-3 text-sm font-bold" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-black">Price</span>
            <input
              value={form.price}
              onChange={(event) => onChange({ ...form, price: event.target.value })}
              className="h-11 w-full rounded border border-black/10 px-3 text-sm font-bold"
              inputMode="decimal"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-black">Category</span>
            <select
              value={form.categorySlug}
              onChange={(event) => onChange({ ...form, categorySlug: event.target.value })}
              className="h-11 w-full rounded border border-black/10 bg-white px-3 text-sm font-bold"
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-black">Description</span>
          <textarea
            value={form.description}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            className="min-h-24 w-full rounded border border-black/10 px-3 py-2 text-sm font-bold"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-black">Image URL</span>
          <input value={form.imageUrl} onChange={(event) => onChange({ ...form, imageUrl: event.target.value })} className="h-11 w-full rounded border border-black/10 px-3 text-sm font-bold" />
        </label>
        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded border border-black/10 bg-white px-3 text-sm font-black">
          <Upload aria-hidden className="h-4 w-4" />
          Upload image
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => onUpload(event.target.files?.[0] ?? null)} />
        </label>
        {form.imageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded border border-black/8 bg-white">
            <Image src={form.imageUrl} alt={form.name || "Menu item image"} fill sizes="430px" className="object-cover" />
          </div>
        ) : null}
        <label className="block">
          <span className="mb-2 block text-sm font-black">Tags</span>
          <input value={form.tags} onChange={(event) => onChange({ ...form, tags: event.target.value })} className="h-11 w-full rounded border border-black/10 px-3 text-sm font-bold" />
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          <Toggle label="Visible" checked={form.visible} onChange={(checked) => onChange({ ...form, visible: checked })} />
          <Toggle label="Popular" checked={form.popular} onChange={(checked) => onChange({ ...form, popular: checked })} />
          <Toggle label="Weekend" checked={form.weekendOnly} onChange={(checked) => onChange({ ...form, weekendOnly: checked })} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={onSave} disabled={busy === "menu-save"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-burgundy-900 px-4 text-sm font-black text-white disabled:bg-charcoal/25">
            {busy === "menu-save" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Save aria-hidden className="h-4 w-4" />}
            Save
          </button>
          <button type="button" onClick={onDelete} disabled={!form.id || busy === "menu-delete"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/10 px-4 text-sm font-black disabled:text-charcoal/35">
            <Trash2 aria-hidden className="h-4 w-4" />
            {form.source === "custom" ? "Remove" : "Hide"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GuestMessageBox({
  entityType,
  entityId,
  to,
  templates,
  onMessage,
  busy,
}: {
  entityType: "order" | "reservation" | "catering";
  entityId: string;
  to: string;
  templates: Array<[string, string]>;
  onMessage: (payload: GuestMessagePayload) => void;
  busy: string | null;
}) {
  const [subject, setSubject] = useState(templates[0]?.[0] ?? "Pista House update");
  const [body, setBody] = useState(templates[0]?.[1] ?? "");

  return (
    <div className="mt-4 grid gap-3 rounded border border-black/8 bg-white p-3">
      <div className="flex items-center gap-2">
        <MessageSquare aria-hidden className="h-4 w-4 text-burgundy-700" />
        <h4 className="text-sm font-black text-ink">Guest messaging</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map(([templateSubject, templateBody]) => (
          <button
            key={templateSubject}
            type="button"
            onClick={() => {
              setSubject(templateSubject);
              setBody(templateBody);
            }}
            className="rounded bg-smoke px-2.5 py-1.5 text-xs font-black text-charcoal"
          >
            {templateSubject}
          </button>
        ))}
      </div>
      <input value={subject} onChange={(event) => setSubject(event.target.value)} className="h-10 rounded border border-black/10 px-2 text-sm font-bold" />
      <textarea value={body} onChange={(event) => setBody(event.target.value)} className="min-h-24 rounded border border-black/10 p-2 text-sm font-bold" />
      <button
        type="button"
        onClick={() => onMessage({ entityType, entityId, to, subject, message: body })}
        disabled={busy === `message-${entityId}`}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded bg-burgundy-900 px-3 text-xs font-black text-white"
      >
        <Send aria-hidden className="h-3.5 w-3.5" />
        Send message
      </button>
    </div>
  );
}

function TablesPanel({
  tables,
  form,
  onForm,
  onSave,
  busy,
}: {
  tables: AdminTable[];
  form: { id: string; name: string; capacity: string; section: string; x: string; y: string; active: boolean };
  onForm: (form: { id: string; name: string; capacity: string; section: string; x: string; y: string; active: boolean }) => void;
  onSave: () => void;
  busy: string | null;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid gap-4">
        <div className="relative min-h-[360px] rounded border border-black/8 bg-smoke p-4">
          {tables.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => onForm({ id: table.id, name: table.name, capacity: String(table.capacity), section: table.section ?? "", x: String(table.x), y: String(table.y), active: table.active })}
              className={cn(
                "absolute grid h-20 w-28 place-items-center rounded border text-center text-xs font-black shadow-sm",
                table.active ? "border-burgundy-900 bg-white text-ink" : "border-black/10 bg-white/60 text-charcoal/45",
              )}
              style={{ left: `${Math.min(Math.max(table.x, 0), 88)}%`, top: `${Math.min(Math.max(table.y, 0), 78)}%`, transform: "translate(-50%, -50%)" }}
            >
              <span>{table.name}</span>
              <span>{table.capacity} seats</span>
            </button>
          ))}
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {tables.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => onForm({ id: table.id, name: table.name, capacity: String(table.capacity), section: table.section ?? "", x: String(table.x), y: String(table.y), active: table.active })}
              className="rounded border border-black/8 p-3 text-left text-sm"
            >
              <p className="font-black text-ink">{table.name}</p>
              <p className="font-bold text-charcoal/60">{table.capacity} seats · {table.section ?? "Floor"}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded border border-black/8 bg-smoke p-4">
        <h3 className="mb-4 text-xl font-black text-ink">{form.id ? "Edit table" : "New table"}</h3>
        <div className="grid gap-3">
          <input value={form.name} onChange={(event) => onForm({ ...form, name: event.target.value })} placeholder="Table name" className="h-11 rounded border border-black/10 px-3 text-sm font-bold" />
          <div className="grid grid-cols-3 gap-2">
            <input value={form.capacity} onChange={(event) => onForm({ ...form, capacity: event.target.value })} placeholder="Seats" className="h-11 rounded border border-black/10 px-3 text-sm font-bold" inputMode="numeric" />
            <input value={form.x} onChange={(event) => onForm({ ...form, x: event.target.value })} placeholder="X" className="h-11 rounded border border-black/10 px-3 text-sm font-bold" inputMode="numeric" />
            <input value={form.y} onChange={(event) => onForm({ ...form, y: event.target.value })} placeholder="Y" className="h-11 rounded border border-black/10 px-3 text-sm font-bold" inputMode="numeric" />
          </div>
          <input value={form.section} onChange={(event) => onForm({ ...form, section: event.target.value })} placeholder="Section" className="h-11 rounded border border-black/10 px-3 text-sm font-bold" />
          <Toggle label="Active" checked={form.active} onChange={(checked) => onForm({ ...form, active: checked })} />
          <button type="button" onClick={onSave} disabled={busy === "table-save"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-burgundy-900 px-4 text-sm font-black text-white">
            <Save aria-hidden className="h-4 w-4" />
            Save table
          </button>
        </div>
      </div>
    </div>
  );
}

function PromotionsPanel({
  announcements,
  form,
  onForm,
  onSave,
  busy,
}: {
  announcements: AdminAnnouncement[];
  form: AnnouncementFormState;
  onForm: (form: AnnouncementFormState) => void;
  onSave: () => void;
  busy: string | null;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-3">
        {announcements.map((announcement) => (
          <button key={announcement.id} type="button" onClick={() => onForm({ ...announcement, startsAt: announcement.startsAt ?? "", endsAt: announcement.endsAt ?? "" })} className="rounded border border-black/8 p-4 text-left">
            <p className="font-black text-ink">{announcement.title}</p>
            <p className="mt-1 text-sm font-bold text-charcoal/65">{announcement.message}</p>
            <p className="mt-2 text-xs font-black text-burgundy-700">{announcement.active ? "Active" : "Inactive"}</p>
          </button>
        ))}
      </div>
      <div className="rounded border border-black/8 bg-smoke p-4">
        <h3 className="mb-4 text-xl font-black text-ink">{form.id ? "Edit announcement" : "New announcement"}</h3>
        <div className="grid gap-3">
          <input value={form.title} onChange={(event) => onForm({ ...form, title: event.target.value })} className="h-11 rounded border border-black/10 px-3 text-sm font-bold" />
          <textarea value={form.message} onChange={(event) => onForm({ ...form, message: event.target.value })} className="min-h-24 rounded border border-black/10 p-3 text-sm font-bold" />
          <input value={form.kind} onChange={(event) => onForm({ ...form, kind: event.target.value })} className="h-11 rounded border border-black/10 px-3 text-sm font-bold" />
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.startsAt ?? ""} onChange={(event) => onForm({ ...form, startsAt: event.target.value })} type="datetime-local" className="h-11 rounded border border-black/10 px-3 text-sm font-bold" />
            <input value={form.endsAt ?? ""} onChange={(event) => onForm({ ...form, endsAt: event.target.value })} type="datetime-local" className="h-11 rounded border border-black/10 px-3 text-sm font-bold" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Active" checked={form.active} onChange={(checked) => onForm({ ...form, active: checked })} />
            <Toggle label="Home" checked={form.showOnHome} onChange={(checked) => onForm({ ...form, showOnHome: checked })} />
            <Toggle label="Menu" checked={form.showOnMenu} onChange={(checked) => onForm({ ...form, showOnMenu: checked })} />
            <Toggle label="Order" checked={form.showOnOrder} onChange={(checked) => onForm({ ...form, showOnOrder: checked })} />
          </div>
          <button type="button" onClick={onSave} disabled={busy === "announcement-save"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-burgundy-900 px-4 text-sm font-black text-white">
            <Megaphone aria-hidden className="h-4 w-4" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

function CateringPanel({
  enquiries,
  selected,
  onSelect,
  onUpdate,
  onMessage,
  busy,
}: {
  enquiries: AdminCateringEnquiry[];
  selected: AdminCateringEnquiry | null;
  onSelect: (enquiry: AdminCateringEnquiry) => void;
  onUpdate: (enquiry: AdminCateringEnquiry, status: CateringStatus) => void;
  onMessage: (payload: GuestMessagePayload) => void;
  busy: string | null;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-3">
        {enquiries.map((enquiry) => (
          <button key={enquiry.id} type="button" onClick={() => onSelect(enquiry)} className="rounded border border-black/8 p-4 text-left">
            <div className="flex justify-between gap-3">
              <p className="font-black text-ink">{enquiry.name}</p>
              <span className="text-xs font-black text-burgundy-700">{cateringStatusLabels[enquiry.status]}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-charcoal/65">{enquiry.guestCount ?? "?"} guests · {enquiry.eventDate ?? "Date TBC"}</p>
            <p className="mt-2 line-clamp-2 text-sm text-charcoal/60">{enquiry.message}</p>
          </button>
        ))}
      </div>
      {selected ? (
        <aside className="rounded border border-black/8 bg-smoke p-4">
          <h3 className="text-2xl font-black text-ink">{selected.id}</h3>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-charcoal/58">Guest</dt><dd className="font-black">{selected.name}</dd></div>
            <div className="grid gap-1"><dt className="text-charcoal/58">Email</dt><dd className="break-all font-black">{selected.email}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-charcoal/58">Quote</dt><dd className="font-black">{selected.displayQuote ?? "Not quoted"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-charcoal/58">Deposit</dt><dd className="font-black">{selected.displayDeposit ?? "Not set"}</dd></div>
          </dl>
          <p className="mt-4 rounded bg-white p-3 text-sm font-bold text-charcoal/70">{selected.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(cateringStatusLabels) as CateringStatus[]).map((status) => (
              <button key={status} type="button" onClick={() => onUpdate(selected, status)} disabled={busy === `catering-${selected.id}`} className="rounded bg-burgundy-900 px-3 py-2 text-xs font-black text-white">
                {cateringStatusLabels[status]}
              </button>
            ))}
          </div>
          <GuestMessageBox
            entityType="catering"
            entityId={selected.id}
            to={selected.email}
            templates={[
              ["Catering quote follow-up", `Hi ${selected.name}, thanks for your catering enquiry. We will confirm menu options and pricing shortly.`],
              ["Deposit reminder", `Hi ${selected.name}, your Pista House catering deposit is now due to secure the date.`],
              ["Event confirmed", `Your Pista House catering event is confirmed. We look forward to serving you.`],
            ]}
            onMessage={onMessage}
            busy={busy}
          />
        </aside>
      ) : (
        <div className="rounded border border-black/8 bg-smoke p-4 text-sm font-bold text-charcoal/65">No catering enquiry selected.</div>
      )}
    </div>
  );
}

function AuditPanel({
  range,
  metrics,
  onRange,
}: {
  range: AuditRangeKey;
  metrics: AuditMetrics | null;
  onRange: (range: AuditRangeKey) => void;
}) {
  const ranges: AuditRangeKey[] = ["daily", "weekly", "monthly", "yearly"];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {ranges.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onRange(item)}
            className={cn("rounded px-4 py-2 text-sm font-black capitalize", range === item ? "bg-burgundy-900 text-white" : "bg-smoke text-charcoal")}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Orders", metrics?.totalOrders ?? 0],
          ["Paid", metrics?.paidOrders ?? 0],
          ["Gross", metrics?.displayGross ?? "$0.00"],
          ["Average", metrics?.displayAverageOrder ?? "$0.00"],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-black/8 bg-smoke p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-charcoal/48">{label}</p>
            <p className="mt-2 text-3xl font-black text-burgundy-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded border border-black/8 p-4">
          <h3 className="mb-3 text-lg font-black text-ink">Top items</h3>
          <div className="grid gap-2">
            {(metrics?.topItems ?? []).map((item) => (
              <div key={item.name} className="flex justify-between gap-3 border-b border-black/8 py-2 text-sm">
                <span className="font-bold">{item.name}</span>
                <span className="font-black">{item.quantity} · {item.displayGross}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded border border-black/8 p-4">
          <h3 className="mb-3 text-lg font-black text-ink">Status mix</h3>
          <div className="grid gap-2">
            {Object.entries(metrics?.statusCounts ?? {}).map(([status, count]) => (
              <div key={status} className="flex justify-between gap-3 border-b border-black/8 py-2 text-sm">
                <span className="font-bold">{statusLabels[status as AdminOrderStatus] ?? status}</span>
                <span className="font-black">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ health }: { health: HealthResponse | null }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="rounded border border-black/8 p-4">
        <h3 className="mb-3 text-lg font-black text-ink">Service health</h3>
        <div className="grid gap-2">
          {Object.entries(health?.services ?? {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-3 border-b border-black/8 py-2 text-sm">
              <span className="font-bold">{serviceLabels[key] ?? key}</span>
              <span className={cn("rounded px-2 py-1 text-xs font-black", value ? "bg-leaf/10 text-leaf" : "bg-burgundy-500/10 text-burgundy-700")}>
                {value ? "Connected" : "Missing"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded border border-black/8 p-4">
        <h3 className="mb-3 text-lg font-black text-ink">Restaurant</h3>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-3 border-b border-black/8 py-2">
            <dt className="text-charcoal/58">Name</dt>
            <dd className="font-black">{RESTAURANT_CONFIG.name}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-black/8 py-2">
            <dt className="text-charcoal/58">Phone</dt>
            <dd className="font-black">{RESTAURANT_CONFIG.phone}</dd>
          </div>
          <div className="flex justify-between gap-3 border-b border-black/8 py-2">
            <dt className="text-charcoal/58">Email</dt>
            <dd className="font-black">{RESTAURANT_CONFIG.email}</dd>
          </div>
          <div className="grid gap-1 border-b border-black/8 py-2">
            <dt className="text-charcoal/58">Address</dt>
            <dd className="font-black">{RESTAURANT_CONFIG.address}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex h-10 items-center justify-between gap-2 rounded border border-black/10 bg-white px-3 text-sm font-black">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function StatusBadge({ status }: { status: AdminOrderStatus }) {
  return (
    <span className="inline-flex rounded bg-burgundy-900 px-2.5 py-1 text-xs font-black text-white">
      {statusLabels[status]}
    </span>
  );
}

function BookingStatusBadge({ status }: { status: AdminBookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-2.5 py-1 text-xs font-black",
        status === "CONFIRMED" && "bg-leaf/10 text-leaf",
        status === "REQUESTED" && "bg-saffron-100 text-burgundy-900",
        status === "CANCELLED" && "bg-burgundy-500/10 text-burgundy-700",
      )}
    >
      {bookingStatusLabels[status]}
    </span>
  );
}

function PaymentBadge({ status }: { status: AdminOrder["paymentStatus"] }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-black", status === "PAID" ? "bg-leaf/10 text-leaf" : "bg-saffron-100 text-burgundy-900")}>
      <CreditCard aria-hidden className="h-3.5 w-3.5" />
      {paymentLabels[status]}
    </span>
  );
}

function parseTags(value: string): DietaryTag[] {
  const allowed = new Set(["V", "VG", "H", "S", "GF"]);
  return value
    .split(/[,\s]+/)
    .map((tag) => tag.trim().toUpperCase())
    .filter((tag): tag is DietaryTag => allowed.has(tag));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = typeof data.error === "string" ? data.error : "Request failed";
    throw new Error(error);
  }

  return data as T;
}
