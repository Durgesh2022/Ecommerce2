// services/productService.ts

import Cookies from "js-cookie";

const isServer = typeof window === "undefined";

const BASE_URL = isServer
  ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_SITE_URL
  : "";


const getAuthHeaders = () => ({
  "content-type": "application/json",
  Authorization: `Bearer ${Cookies.get("token")}`,
});

const handleFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[${res.status}] Fetch failed for ${url}`);
      console.error("Error response:", errorText);
      throw new Error(`Fetch error: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await res.json();
    } else {
      console.error("Non-JSON response received:", await res.text());
      throw new Error("Expected JSON response");
    }
  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
};

// Add product
export const addNewProduct = async (formData) => {
  return await handleFetch("/api/admin/add-product", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(formData),
  });
};

// Get all products
export const getAllAdminProducts = async () => {
  return await handleFetch(`${BASE_URL}/api/admin/all-products`, {
    method: "GET",
    cache: "force-cache",
  });
};

// Update product
export const updateAProduct = async (formData) => {
  return await handleFetch("/api/admin/update-product", {
    method: "PUT",
    headers: getAuthHeaders(),
    cache: "force-cache",
    body: JSON.stringify(formData),
  });
};

// Delete product
export const deleteAProduct = async (id) => {
  return await handleFetch(`/api/admin/delete-product?id=${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
};

// Product by category
export const productByCategory = async (id) => {
  return await handleFetch(`${BASE_URL}/api/admin/product-by-category?id=${id}`, {
    method: "GET",
    cache: "force-cache",
  });
};

// Product by ID
export const productById = async (id) => {
  return await handleFetch(`${BASE_URL}/api/admin/product-by-id?id=${id}`, {
    method: "GET",
    cache: "force-cache",
  });
};
