import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const { amount, planId, credits } = await req.json();

    // Check if it's the Monthly Subscription Plan (ID: 4)
    /*if (planId === 4) {
      const subscriptionOptions = {
        // REPLACE WITH YOUR ACTUAL PLAN ID FROM RAZORPAY DASHBOARD
        plan_id: "plan_T58C9oJ3zj9Mz8", 
        customer_notify: 1,
        total_count: 12, // Example: Subscription runs for 12 billing cycles
        notes: {
          website: "PrintCafe",
          planId: planId,
        },
      };

      const subscription = await razorpay.subscriptions.create(subscriptionOptions);
      // Return isSubscription: true so frontend knows how to handle it
      return NextResponse.json({ success: true, isSubscription: true, order: subscription });
    }*/

    // Standard One-Time Payment for other plans
    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        website: "PrintCafe",
        planId: planId,
        credits: credits
      },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ success: true, isSubscription: false, order });
    
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}