//add a new product service

import Cookies from "js-cookie";

const isServer = typeof window === "undefined";

const BASE_URL = isServer
  ? process.env.NEXT_PUBLIC_SITE_URL || "https://your-project-name.vercel.app" // fallback for build/deploy
  : ""; // client can use relative path


export const addNewProduct = async (formData) => {
  try {
    const response = await fetch("/api/admin/add-product", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllAdminProducts = async () => {
  try {
    const res = await fetch("${BASE_URL}/api/admin/all-products", {
      method: "GET",
      cache: 'force-cache'
    });

    const data = await res.json();

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updateAProduct = async (formData) => {
  try {
    const res = await fetch("/api/admin/update-product", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      cache: 'force-cache',
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    return data;
  } catch (e) {
    console.log(e);
  }
};

export const deleteAProduct = async (id) => {
  try {
    const res = await fetch(`/api/admin/delete-product?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    const data = await res.json();

    return data;
  } catch (e) {
    console.log(e);
  }
};

export const productByCategory = async (id) => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/product-by-category?id=${id}`,
      {
        method: "GET",
        cache: 'force-cache',
      }
    );

    const data = await res.json();

    return data;
  } catch (e) {
    console.log(e);
  }
};

export const productById = async (id) => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/admin/product-by-id?id=${id}`,
      {
        method: "GET",
         cache: 'force-cache',
      }
    );

    const data = await res.json();

    return data;
  } catch (e) {
    console.log(e);
  }
};
