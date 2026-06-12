export const orderingPauseDefaultMessage = "Online ordering is temporarily paused while the kitchen catches up. Please call the restaurant if you need help.";

export type OrderingPauseAction = "on" | "pause_20" | "pause_40" | "pause_tomorrow" | "pause_indefinite";

export type OrderingPauseState =
  | { enabled: false }
  | {
      enabled: true;
      message: string;
      pausedAt: string;
      pausedUntil: string | null;
    };

export type OrderingPauseStatus = {
  paused: boolean;
  message: string;
  pausedAt: string | null;
  pausedUntil: string | null;
};
