"use client";

import Notification from "@/components/Notification";
import { GlobalContext } from "@/context";
import { fetchAllAddresses } from "@/services/address";
import { createNewOrder } from "@/services/order";
import { callStripeSession } from "@/services/stripe";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { toast } from "react-toastify";

export default function Checkout() {
  const {
    cartItems,
    user,
    addresses,
    setAddresses,
    checkoutFormData,
    setCheckoutFormData,
    setCartItems, // Add this to clear cart after successful order
  } = useContext(GlobalContext);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  const router = useRouter();
  const params = useSearchParams();

  // Use environment variable instead of hardcoding (ensure this is set in your .env.local)
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  // Initialize stripe outside component to avoid re-initialization
  const stripePromise = loadStripe(publishableKey);

  async function getAllAddresses() {
    try {
      if (!user?._id) return;
      
      const res = await fetchAllAddresses(user._id);
      if (res.success) {
        setAddresses(res.data);
      } else {
        toast.error("Failed to fetch addresses", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Something went wrong while fetching addresses", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }

  useEffect(() => {
    if (user?._id) getAllAddresses();
  }, [user]);

  useEffect(() => {
    async function createFinalOrder() {
      try {
        // Check for Stripe success and validate parameters
        const isStripe = localStorage.getItem("stripe") === "true";
        const hasStatus = params.get("status") === "success";
        const hasItems = cartItems && cartItems.length > 0;
        
        if (isStripe && hasStatus && hasItems) {
          setIsOrderProcessing(true);
          setStripeError(null);
          
          // Get checkout form data from localStorage
          const getCheckoutFormData = JSON.parse(
            localStorage.getItem("checkoutFormData")
          );
          
          if (!getCheckoutFormData || !getCheckoutFormData.shippingAddress) {
            throw new Error("Shipping information is missing");
          }

          const createFinalCheckoutFormData = {
            user: user?._id,
            shippingAddress: getCheckoutFormData.shippingAddress,
            orderItems: cartItems.map((item) => ({
              qty: 1,
              product: item.productID,
            })),
            paymentMethod: "Stripe",
            totalPrice: cartItems.reduce(
              (total, item) => item.productID.price + total,
              0
            ),
            isPaid: true,
            isProcessing: true,
            paidAt: new Date(),
          };

          const res = await createNewOrder(createFinalCheckoutFormData);

          if (res.success) {
            setIsOrderProcessing(false);
            setOrderSuccess(true);
            // Clear cart and localStorage after successful order
            setCartItems([]);
            localStorage.removeItem("stripe");
            localStorage.removeItem("checkoutFormData");
            
            toast.success(res.message, {
              position: toast.POSITION.TOP_RIGHT,
            });
          } else {
            throw new Error(res.message || "Failed to create order");
          }
        }
      } catch (error) {
        console.error("Error creating order:", error);
        setIsOrderProcessing(false);
        setOrderSuccess(false);
        setStripeError(error.message || "Something went wrong with your order");
        
        toast.error(error.message || "Failed to process your order", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }

    if (params.get("status")) {
      createFinalOrder();
    }
  }, [params, cartItems, user]);

  function handleSelectedAddress(getAddress) {
    if (getAddress._id === selectedAddress) {
      setSelectedAddress(null);
      setCheckoutFormData({
        ...checkoutFormData,
        shippingAddress: {},
      });
      return;
    }

    setSelectedAddress(getAddress._id);
    setCheckoutFormData({
      ...checkoutFormData,
      shippingAddress: {
        ...checkoutFormData.shippingAddress,
        fullName: getAddress.fullName,
        city: getAddress.city,
        country: getAddress.country,
        postalCode: getAddress.postalCode,
        address: getAddress.address,
      },
    });
  }

  async function handleCheckout() {
    try {
      setIsOrderProcessing(true);
      setStripeError(null);
      
      // Validate cart and address
      if (!cartItems?.length) {
        throw new Error("Your cart is empty");
      }
      
      if (Object.keys(checkoutFormData.shippingAddress || {}).length === 0) {
        throw new Error("Please select a shipping address");
      }
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Could not initialize Stripe");
      }

      // Prepare line items for Stripe
      const createLineItems = cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            images: [item.productID.imageUrl],
            name: item.productID.name,
          },
          unit_amount: Math.round(item.productID.price * 100), // Ensure amount is an integer
        },
        quantity: 1,
      }));

      // Save checkout data before redirect
      localStorage.setItem("stripe", "true");
      localStorage.setItem("checkoutFormData", JSON.stringify(checkoutFormData));
      
      // Create Stripe session
      const res = await callStripeSession(createLineItems);
      if (!res || !res.id) {
        throw new Error("Failed to create Stripe session");
      }

      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: res.id,
      });

      if (error) {
        throw new Error(error.message || "Payment processing failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsOrderProcessing(false);
      setStripeError(error.message || "Failed to process payment");
      
      toast.error(error.message || "Payment processing failed", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }

  useEffect(() => {
    if (orderSuccess) {
      const timer = setTimeout(() => {
        router.push("/orders");
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [orderSuccess, router]);

  if (orderSuccess) {
    return (
      <section className="h-screen bg-gray-200 text-black">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mt-8 max-w-screen-xl px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-6 sm:px-8 sm:py-10 flex flex-col gap-5 items-center">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h1 className="font-bold text-xl text-center">
                  Your payment was successful!
                </h1>
                <p className="text-gray-600 text-center">
                  You will be redirected to your orders page in a moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isOrderProcessing) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center flex-col">
        <PulseLoader
          color={"#000000"}
          loading={isOrderProcessing}
          size={30}
          data-testid="loader"
        />
        <p className="mt-4 text-gray-700">Processing your payment...</p>
      </div>
    );
  }

  const calculateTotal = () => {
    if (!cartItems?.length) return 0;
    return cartItems.reduce((total, item) => item.productID.price + total, 0).toFixed(2);
  };

  return (
    <div>
      {stripeError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-4 sm:mx-10 lg:mx-20 xl:mx-32">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{stripeError}</span>
        </div>
      )}
      
      <div className="grid sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-32 text-black">
        <div className="px-4 pt-8">
          <p className="font-bold text-xl">Cart Summary</p>
          <div className="mt-8 space-y-3 rounded-lg border bg-white px-2 py-4 sm:px-5">
            {cartItems && cartItems.length ? (
              cartItems.map((item) => (
                <div
                  className="flex flex-col rounded-lg bg-white sm:flex-row"
                  key={item._id}
                >
                  <img
                    src={item?.productID?.imageUrl}
                    alt={item?.productID?.name || "Product"}
                    className="m-2 h-24 w-28 rounded-md border object-cover object-center"
                  />
                  <div className="flex w-full flex-col px-4 py-4">
                    <span className="font-bold">
                      {item?.productID?.name || "Product"}
                    </span>
                    <span className="font-semibold">
                      ${item?.productID?.price?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center">Your cart is empty</div>
            )}
          </div>
        </div>
        <div className="mt-10 bg-gray-50 px-4 pt-8 lg:mt-0 rounded-lg">
          <p className="text-xl font-medium">Shipping Address</p>
          <p className="text-gray-600 mb-6">
            Please select a shipping address for your order
          </p>
          <div className="w-full mr-0 mb-0 ml-0 space-y-6">
            {addresses && addresses.length ? (
              addresses.map((item) => (
                <div
                  onClick={() => handleSelectedAddress(item)}
                  key={item._id}
                  className={`border p-6 rounded-lg cursor-pointer transition-all ${
                    item._id === selectedAddress 
                      ? "border-black bg-gray-50 shadow-md" 
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <p className="font-medium">{item.fullName}</p>
                  <p className="text-gray-600 mt-1">{item.address}</p>
                  <p className="text-gray-600">{item.city}, {item.country} {item.postalCode}</p>
                  <div className="mt-4">
                    <span 
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        item._id === selectedAddress
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {item._id === selectedAddress ? "Selected" : "Select Address"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No addresses found</p>
                <button
                  onClick={() => router.push("/account")}
                  className="mt-3 inline-block bg-gray-800 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-black transition-colors"
                >
                  Add New Address
                </button>
              </div>
            )}
          </div>
          
          {addresses && addresses.length > 0 && (
            <button
              onClick={() => router.push("/account")}
              className="mt-6 inline-block bg-gray-200 text-gray-800 px-4 py-2 text-sm rounded-md hover:bg-gray-300 transition-colors"
            >
              Add New Address
            </button>
          )}
          
          <div className="mt-6 border-t border-b py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Subtotal</p>
              <p className="text-lg font-bold text-gray-900">
                ${calculateTotal()}
              </p>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-medium text-gray-900">Shipping</p>
              <p className="text-lg font-bold text-gray-900">Free</p>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <p className="text-base font-medium text-gray-900">Total</p>
              <p className="text-xl font-bold text-gray-900">
                ${calculateTotal()}
              </p>
            </div>
            <div className="mt-8 pb-8">
              <button
                disabled={
                  !cartItems?.length ||
                  Object.keys(checkoutFormData.shippingAddress || {}).length === 0 ||
                  isOrderProcessing
                }
                onClick={handleCheckout}
                className="w-full py-3 px-6 bg-black text-white font-medium rounded-md 
                  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors
                  flex items-center justify-center"
              >
                {isOrderProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Notification />
    </div>
  );
}