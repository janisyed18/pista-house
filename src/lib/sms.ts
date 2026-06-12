export type SmsConfig =
  | {
      enabled: true;
      accountSid: string;
      authToken: string;
      fromNumber?: string;
      messagingServiceSid?: string;
    }
  | { enabled: false };

export type SmsSendResult =
  | { status: "sent"; providerMessageId?: string }
  | { status: "skipped"; reason: "sms_not_configured" | "missing_phone" | "invalid_phone" | "provider_error"; detail?: string };

type SmsFetchResponse = {
  ok: boolean;
  status?: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

type SmsFetcher = (url: string, init: RequestInit) => Promise<SmsFetchResponse>;

export function getSmsConfig(): SmsConfig {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();

  if (!accountSid || !authToken || (!fromNumber && !messagingServiceSid)) {
    return { enabled: false };
  }

  return {
    enabled: true,
    accountSid,
    authToken,
    fromNumber,
    messagingServiceSid,
  };
}

export function normalizeAustralianSmsNumber(phone?: string | null) {
  const compact = phone?.replace(/[^\d+]/g, "") ?? "";

  if (!compact) {
    return null;
  }

  if (/^04\d{8}$/.test(compact)) {
    return `+61${compact.slice(1)}`;
  }

  if (/^614\d{8}$/.test(compact)) {
    return `+${compact}`;
  }

  if (/^\+614\d{8}$/.test(compact)) {
    return compact;
  }

  return null;
}

export function buildOrderReadySms({ orderId }: { orderId: string; pickupTime: string }) {
  return `Your Pista House pickup order ${orderId} is ready for pickup. Show your order QR/code at the counter.`;
}

export async function sendOrderReadySms({
  phone,
  orderId,
  pickupTime,
  fetcher = fetch as SmsFetcher,
}: {
  phone?: string | null;
  orderId: string;
  pickupTime: string;
  fetcher?: SmsFetcher;
}): Promise<SmsSendResult> {
  const config = getSmsConfig();

  if (!config.enabled) {
    return { status: "skipped", reason: "sms_not_configured" };
  }

  if (!phone?.trim()) {
    return { status: "skipped", reason: "missing_phone" };
  }

  const to = normalizeAustralianSmsNumber(phone);

  if (!to) {
    return { status: "skipped", reason: "invalid_phone" };
  }

  const body = new URLSearchParams({
    To: to,
    Body: buildOrderReadySms({ orderId, pickupTime }),
  });

  if (config.messagingServiceSid) {
    body.set("MessagingServiceSid", config.messagingServiceSid);
  } else if (config.fromNumber) {
    body.set("From", config.fromNumber);
  }

  try {
    const response = await fetcher(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const detail = response.text ? await response.text() : `Twilio returned ${response.status ?? "an error"}`;
      return { status: "skipped", reason: "provider_error", detail };
    }

    const payload = response.json ? await response.json() : null;
    const providerMessageId = isTwilioResponse(payload) ? payload.sid : undefined;

    return { status: "sent", providerMessageId };
  } catch (error) {
    return {
      status: "skipped",
      reason: "provider_error",
      detail: error instanceof Error ? error.message : "SMS provider request failed",
    };
  }
}

function isTwilioResponse(payload: unknown): payload is { sid: string } {
  return typeof payload === "object" && payload !== null && "sid" in payload && typeof payload.sid === "string";
}
