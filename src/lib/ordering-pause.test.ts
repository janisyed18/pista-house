import { describe, expect, it } from "vitest";

import {
  buildOrderingPauseState,
  getOrderingPauseStatus,
  orderingPauseDefaultMessage,
  serializeOrderingPauseStatus,
  type OrderingPauseState,
} from "@/lib/ordering-pause";

const now = new Date("2026-06-12T12:00:00.000Z");

describe("ordering pause helpers", () => {
  it("treats missing or disabled config as accepting orders", () => {
    expect(getOrderingPauseStatus(null, now)).toMatchObject({
      paused: false,
      message: orderingPauseDefaultMessage,
    });
    expect(getOrderingPauseStatus({ enabled: false }, now)).toMatchObject({ paused: false });
  });

  it("keeps indefinite pauses active until manually resumed", () => {
    const state: OrderingPauseState = {
      enabled: true,
      message: "Kitchen is catching up. Please call us for urgent orders.",
      pausedAt: "2026-06-12T11:45:00.000Z",
      pausedUntil: null,
    };

    expect(getOrderingPauseStatus(state, now)).toMatchObject({
      paused: true,
      message: "Kitchen is catching up. Please call us for urgent orders.",
      pausedUntil: null,
    });
  });

  it("auto-resumes expired timed pauses", () => {
    const state: OrderingPauseState = {
      enabled: true,
      message: "Paused for 20 minutes.",
      pausedAt: "2026-06-12T11:30:00.000Z",
      pausedUntil: "2026-06-12T11:50:00.000Z",
    };

    expect(getOrderingPauseStatus(state, now)).toMatchObject({
      paused: false,
      pausedUntil: "2026-06-12T11:50:00.000Z",
    });
  });

  it("builds preset pause windows", () => {
    expect(buildOrderingPauseState("pause_20", "Busy kitchen", now)).toMatchObject({
      enabled: true,
      message: "Busy kitchen",
      pausedUntil: "2026-06-12T12:20:00.000Z",
    });
    expect(buildOrderingPauseState("on", "", now)).toEqual({ enabled: false });
  });

  it("serializes status for client display", () => {
    expect(serializeOrderingPauseStatus({
      paused: true,
      message: "Orders paused.",
      pausedAt: "2026-06-12T11:45:00.000Z",
      pausedUntil: "2026-06-12T12:20:00.000Z",
    })).toEqual({
      paused: true,
      message: "Orders paused.",
      pausedAt: "2026-06-12T11:45:00.000Z",
      pausedUntil: "2026-06-12T12:20:00.000Z",
    });
  });
});
