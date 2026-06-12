import { afterEach, describe, expect, it, vi } from "vitest";

import { buildOrderReadySms, getSmsConfig, normalizeAustralianSmsNumber, sendOrderReadySms } from "@/lib/sms";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("normalizeAustralianSmsNumber", () => {
  it("normalizes Australian mobile numbers to E.164 format", () => {
    expect(normalizeAustralianSmsNumber("0400 111 222")).toBe("+61400111222");
    expect(normalizeAustralianSmsNumber("+61 400 111 222")).toBe("+61400111222");
    expect(normalizeAustralianSmsNumber("61400111222")).toBe("+61400111222");
  });

  it("returns null when the number is missing or not an Australian mobile", () => {
    expect(normalizeAustralianSmsNumber("")).toBeNull();
    expect(normalizeAustralianSmsNumber("+61296809558")).toBeNull();
    expect(normalizeAustralianSmsNumber("not a phone")).toBeNull();
  });
});

describe("buildOrderReadySms", () => {
  it("builds a concise pickup-ready customer message", () => {
    expect(buildOrderReadySms({ orderId: "PH-1042", pickupTime: "ASAP" })).toBe(
      "Your Pista House pickup order PH-1042 is ready for pickup. Show your order QR/code at the counter.",
    );
  });
});

describe("getSmsConfig", () => {
  it("is disabled when Twilio credentials are missing", () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM_NUMBER;
    delete process.env.TWILIO_MESSAGING_SERVICE_SID;

    expect(getSmsConfig()).toEqual({ enabled: false });
  });

  it("is enabled when credentials and a sender are configured", () => {
    process.env.TWILIO_ACCOUNT_SID = "AC123";
    process.env.TWILIO_AUTH_TOKEN = "token";
    process.env.TWILIO_FROM_NUMBER = "+61400111222";

    expect(getSmsConfig()).toEqual({
      enabled: true,
      accountSid: "AC123",
      authToken: "token",
      fromNumber: "+61400111222",
      messagingServiceSid: undefined,
    });
  });
});

describe("sendOrderReadySms", () => {
  it("skips when the customer has no valid mobile number", async () => {
    process.env.TWILIO_ACCOUNT_SID = "AC123";
    process.env.TWILIO_AUTH_TOKEN = "token";
    process.env.TWILIO_FROM_NUMBER = "+61400111222";

    await expect(sendOrderReadySms({ phone: "+61296809558", orderId: "PH-1042", pickupTime: "ASAP" })).resolves.toEqual({
      status: "skipped",
      reason: "invalid_phone",
    });
  });

  it("sends a Twilio message with form encoded credentials and message fields", async () => {
    process.env.TWILIO_ACCOUNT_SID = "AC123";
    process.env.TWILIO_AUTH_TOKEN = "token";
    process.env.TWILIO_MESSAGING_SERVICE_SID = "MG123";
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sid: "SM123" }),
    });

    await expect(
      sendOrderReadySms({
        phone: "0400 111 222",
        orderId: "PH-1042",
        pickupTime: "ASAP",
        fetcher,
      }),
    ).resolves.toEqual({ status: "sent", providerMessageId: "SM123" });

    expect(fetcher).toHaveBeenCalledWith("https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from("AC123:token").toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: expect.any(URLSearchParams),
    });
    const body = fetcher.mock.calls[0]?.[1]?.body as URLSearchParams;
    expect(body.get("To")).toBe("+61400111222");
    expect(body.get("MessagingServiceSid")).toBe("MG123");
    expect(body.get("Body")).toBe("Your Pista House pickup order PH-1042 is ready for pickup. Show your order QR/code at the counter.");
  });
});
