import type { Prisma } from "@prisma/client";

import {
  orderingPauseDefaultMessage,
  type OrderingPauseAction,
  type OrderingPauseState,
  type OrderingPauseStatus,
} from "@/lib/ordering-pause-shared";
import { hasDatabase, prisma } from "@/lib/prisma";

export const orderingPauseConfigKey = "ordering_pause";
export { orderingPauseDefaultMessage };
export type { OrderingPauseAction, OrderingPauseState, OrderingPauseStatus };

export async function getPersistedOrderingPauseStatus(now = new Date()): Promise<OrderingPauseStatus> {
  if (!hasDatabase()) {
    return getOrderingPauseStatus(null, now);
  }

  const config = await prisma.configOverride.findUnique({
    where: { key: orderingPauseConfigKey },
  });

  return getOrderingPauseStatus(parseOrderingPauseState(config?.value), now);
}

export async function saveOrderingPauseState(state: OrderingPauseState) {
  if (!hasDatabase()) {
    return state;
  }

  await prisma.configOverride.upsert({
    where: { key: orderingPauseConfigKey },
    create: { key: orderingPauseConfigKey, value: state as Prisma.InputJsonValue },
    update: { value: state as Prisma.InputJsonValue },
  });

  return state;
}

export function buildOrderingPauseState(action: OrderingPauseAction, message: string, now = new Date()): OrderingPauseState {
  if (action === "on") {
    return { enabled: false };
  }

  const normalizedMessage = message.trim() || orderingPauseDefaultMessage;
  const pausedAt = now.toISOString();

  if (action === "pause_20") {
    return {
      enabled: true,
      message: normalizedMessage,
      pausedAt,
      pausedUntil: addMinutes(now, 20).toISOString(),
    };
  }

  if (action === "pause_40") {
    return {
      enabled: true,
      message: normalizedMessage,
      pausedAt,
      pausedUntil: addMinutes(now, 40).toISOString(),
    };
  }

  if (action === "pause_tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);

    return {
      enabled: true,
      message: normalizedMessage,
      pausedAt,
      pausedUntil: tomorrow.toISOString(),
    };
  }

  return {
    enabled: true,
    message: normalizedMessage,
    pausedAt,
    pausedUntil: null,
  };
}

export function getOrderingPauseStatus(state: OrderingPauseState | null, now = new Date()): OrderingPauseStatus {
  if (!state?.enabled) {
    return {
      paused: false,
      message: orderingPauseDefaultMessage,
      pausedAt: null,
      pausedUntil: null,
    };
  }

  const pausedUntil = state.pausedUntil;
  const expired = pausedUntil ? new Date(pausedUntil).getTime() <= now.getTime() : false;

  return {
    paused: !expired,
    message: state.message || orderingPauseDefaultMessage,
    pausedAt: state.pausedAt,
    pausedUntil,
  };
}

export function serializeOrderingPauseStatus(status: OrderingPauseStatus) {
  return status;
}

function parseOrderingPauseState(value: Prisma.JsonValue | undefined): OrderingPauseState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  if (value.enabled === false) {
    return { enabled: false };
  }

  if (value.enabled !== true || typeof value.message !== "string" || typeof value.pausedAt !== "string") {
    return null;
  }

  return {
    enabled: true,
    message: value.message,
    pausedAt: value.pausedAt,
    pausedUntil: typeof value.pausedUntil === "string" ? value.pausedUntil : null,
  };
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}
