import AuthUser from "@/middleware/AuthUser";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    // Authentication check
    const isAuthUser = await AuthUser(req);
    if (!isAuthUser) {
      return NextResponse.json({
        success: false,
        message: "Authentication failed. You are not authorized.",
      });
    }

    // Parsing request body
    let lineItems;
    try {
      lineItems = await req.json();
      console.log("Request body:", lineItems); // Debugging
    } catch (jsonError) {
      return NextResponse.json({
        success: false,
        message: "Invalid JSON data in the request.",
        error: jsonError.message,
      });
    }

    // Ensure we have valid line_items for Stripe
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid line items provided for the payment.",
      });
    }

    // Validate each line item
    lineItems.forEach((item, index) => {
      console.log(`Validating item ${index}:`, item);
      
      // Check price_data structure
      if (!item.price_data || typeof item.price_data !== 'object') {
        throw new Error(`Item at index ${index} has invalid price_data`);
      }
      
      // Check currency
      if (!item.price_data.currency) {
        throw new Error(`Item at index ${index} is missing currency`);
      }
      
      // Check product_data
      if (!item.price_data.product_data || typeof item.price_data.product_data !== 'object') {
        throw new Error(`Item at index ${index} has invalid product_data`);
      }
      
      // Check unit_amount (should be integer in cents)
      if (!Number.isInteger(item.price_data.unit_amount) || item.price_data.unit_amount <= 0) {
        throw new Error(`Item at index ${index} has invalid unit_amount: ${item.price_data.unit_amount}`);
      }
      
      // Check quantity
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error(`Item at index ${index} has invalid quantity`);
      }
    });

    // Creating Stripe session
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "http://localhost:3000/checkout?status=success",
        cancel_url: "http://localhost:3000/checkout?status=cancel",
      });

      return NextResponse.json({
        success: true,
        id: session.id,
      });
    } catch (stripeError) {
      console.error("Stripe session creation error:", stripeError);
      return NextResponse.json({
        success: false,
        message: "Stripe session creation failed.",
        error: stripeError.message,
      });
    }
  } catch (generalError) {
    console.error("Error in POST handler:", generalError);
    return NextResponse.json({
      status: 500,
      success: false,
      message: "An internal server error occurred.",
      error: generalError.message,
    });
  }
}