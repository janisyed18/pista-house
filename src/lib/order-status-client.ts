type OrderStatusResponse = {
  status?: string;
  error?: string;
};

type StatusFetch = typeof fetch;

export const orderStatusErrorMessage = "Order status is temporarily unavailable.";

export async function requestOrderStatus(orderId: string, fetcher: StatusFetch = fetch) {
  try {
    const response = await fetcher(`/api/orders/${encodeURIComponent(orderId)}/status`);
    const data = await readOrderStatusResponse(response);

    if (!response.ok) {
      throw new Error(data.error || orderStatusErrorMessage);
    }

    if (!data.status) {
      throw new Error(orderStatusErrorMessage);
    }

    return data.status;
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch") {
      throw error;
    }

    throw new Error(orderStatusErrorMessage);
  }
}

async function readOrderStatusResponse(response: Response): Promise<OrderStatusResponse> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
