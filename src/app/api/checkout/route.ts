import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, stripeSecretKey } = await req.json();

    if (!amount || !stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing billing amount or stripeSecretKey in request body." },
        { status: 400 }
      );
    }

    console.log(`Executing server-side Stripe PaymentIntent creation for: ${amount} ${currency || "USD"}`);

    const stripe = new Stripe(stripeSecretKey.trim(), {
      apiVersion: "2025-01-27.acac" as any, // Standard stable API version
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // convert to cents
      currency: (currency || "usd").toLowerCase(),
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status
    });

  } catch (error: any) {
    console.error("Stripe PaymentIntent exception:", error);
    return NextResponse.json(
      { error: `Payment gateway settlement error: ${error.message || error}` },
      { status: 500 }
    );
  }
}
