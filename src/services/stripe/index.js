import Cookies from "js-cookie";

export const callStripeSession = async (formData) => {
  try {
    const res = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`, // Ensure token is valid
      },
      body: JSON.stringify(formData),
    });

    // Check if response status is OK
    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error response from server:", errorData);
      throw new Error(errorData.message || "Failed to create Stripe session.");
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Error calling Stripe session:", e); // Improved error logging
    return { success: false, message: e.message || "An error occurred." }; // Return a consistent error structure
  }
};
