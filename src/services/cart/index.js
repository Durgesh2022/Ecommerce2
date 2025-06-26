import Cookies from "js-cookie";

const isServer = typeof window === "undefined";

const BASE_URL = isServer
  ? process.env.NEXT_PUBLIC_SITE_URL || "https://your-project-name.vercel.app"
  : "";

// Utility function to safely handle all fetch requests
const handleFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const text = await res.text();
      console.error(`[${res.status}] ${url}`);
      console.error("Error body:", text);
      throw new Error(`Fetch error: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    } else {
      throw new Error("Response was not JSON");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};

// Add item to cart
export const addToCart = async (formData) => {
  return await handleFetch("/api/cart/add-to-cart", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
    body: JSON.stringify(formData),
  });
};

// Get all cart items
export const getAllCartItems = async (id) => {
  return await handleFetch(`${BASE_URL}/api/cart/all-cart-items?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
};

// Delete an item from cart
export const deleteFromCart = async (id) => {
  return await handleFetch(`/api/cart/delete-from-cart?id=${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
};
