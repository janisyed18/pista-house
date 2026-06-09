import { describe, expect, it } from "vitest";

import { publicCateringSchema, toCateringCreateData } from "@/lib/catering";

describe("public catering enquiries", () => {
  it("formats customer catering details for the admin catering pipeline", () => {
    const payload = publicCateringSchema.parse({
      name: "Ayesha Khan",
      email: "ayesha@example.com",
      phone: "+61 400 111 222",
      eventDate: "2026-07-12",
      eventTime: "18:30",
      guestCount: 75,
      eventType: "Wedding",
      serviceStyle: "Delivery",
      suburb: "Parramatta",
      menuInterests: ["Biryani", "Starters"],
      dietaryNeeds: "20 vegetarian meals",
      budget: "$2,500",
      message: "Please quote chicken biryani and haleem.",
    });

    const data = toCateringCreateData(payload);

    expect(data.name).toBe("Ayesha Khan");
    expect(data.email).toBe("ayesha@example.com");
    expect(data.phone).toBe("+61 400 111 222");
    expect(data.guestCount).toBe(75);
    expect(data.eventDate).toEqual(new Date("2026-07-12T00:00:00"));
    expect(data.message).toContain("Event type: Wedding");
    expect(data.message).toContain("Menu interests: Biryani, Starters");
    expect(data.message).toContain("Customer message: Please quote chicken biryani and haleem.");
    expect(data.notes).toBe("Public website catering request. Service style: Delivery. Suburb/venue: Parramatta. Budget: $2,500.");
  });
});
