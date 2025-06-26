import Cookies from "js-cookie";

const isServer = typeof window === "undefined";

const BASE_URL = isServer
  ? process.env.NEXT_PUBLIC_SITE_URL || "https://your-project-name.vercel.app"
  : "";

// Shared fetch handler
const handleFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[${res.status}] ${url}`);
      console.error("Response body:", errorText);
      throw new Error(`Fetch failed: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    } else {
      throw new Error("Expected JSON response");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};

// Create a new order
export const createNewOrder = async (formData) => {
  return await handleFetch(`/api/order/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
    body: JSON.stringify(formData),
  });
};

// Get all orders for a specific user
export const getAllOrdersForUser = async (id) => {
  return await handleFetch(`${BASE_URL}/api/order/get-all-orders?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
};

// Get details of a single order
export const getOrderDetails = async (id) => {
  return await handleFetch(`${BASE_URL}/api/order/order-details?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
};

// Admin: Get all orders from all users
export const getAllOrdersForAllUsers = async () => {
  return await handleFetch(`${BASE_URL}/api/admin/orders/get-all-orders`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
};

// Admin: Update order status
export const updateStatusOfOrder = async (formData) => {
  return await handleFetch(`${BASE_URL}/api/admin/orders/update-order`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
    body: JSON.stringify(formData),
  });
};
