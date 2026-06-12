import type { CartLine } from "@/lib/order";

export type CheckoutPayload = {
  lines: CartLine[];
  pickupTime: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

type CheckoutResponse = {
  url?: string;
  error?: string;
};

type CheckoutFetch = typeof fetch;

const checkoutErrorMessage = "Checkout is temporarily unavailable. Please try again or call the restaurant.";

export async function requestCheckoutUrl(payload: CheckoutPayload, fetcher: CheckoutFetch = fetch) {
  try {
    const response = await fetcher("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await readCheckoutResponse(response);

    if (!response.ok) {
      throw new Error(data.error || checkoutErrorMessage);
    }

    if (!data.url) {
      throw new Error(checkoutErrorMessage);
    }

    return data.url;
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch") {
      throw error;
    }

    throw new Error(checkoutErrorMessage);
  }
}

async function readCheckoutResponse(response: Response): Promise<CheckoutResponse> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
