

"use client";

import Image from "next/image";
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function Page() {
  const { user } = useUser();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleContinue = async () => {
    setMessage("");

    if (paymentMethod !== "promo") {
      alert("This payment method is not active yet.");
      return;
    }

    if (!promoCode.trim()) {
      setMessage("❌ Please enter a promo code");
      return;
    }

    if (promoCode.trim() !== "AURA48512") {
      setMessage("❌ Invalid promo code. Access denied.");
      return;
    }

    if (!user?.primaryEmailAddress?.emailAddress) {
      setMessage("❌ No user email found. Please log in.");
      return;
    }

    setLoading(true);

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + 30);

    const { error } = await supabase.from("payment_subscriptions").insert([
      {
        email: user.primaryEmailAddress.emailAddress,
        method: "promo",
        promo_code: promoCode,
        subscription_start: startDate.toISOString(),
        subscription_expiry: expiryDate.toISOString(),
        is_active: true
      }
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      setMessage("❌ Error: " + (error.message || JSON.stringify(error)));
    } else {
      setMessage("✅ Promo applied! Subscription active for 30 days.");
      setPromoCode("");
    }

    setLoading(false);
  };
  const handleCardNumberChange = (e) => {

    let value = e.target.value.replace(/\D/g, "");


    value = value.replace(/(.{4})/g, "$1 ").trim();

    setCardNumber(value);
  };
  return (
    <div>
      <div className="p-6 pt-0 grid gap-6">
        {/* Payment Methods */}
        <div role="radiogroup" dir="ltr" className="grid grid-cols-4 gap-4">
          {/* Card */}
          <div>
            <label
              htmlFor="card"
              className={`text-sm font-medium flex flex-col items-center justify-center min-h-[120puu
                x] w-full rounded-md border-2 p-4 cursor-pointer ${paymentMethod === "card"
                  ? "border-primary bg-blue-50"
                  : "border-muted"
                }`}
              onClick={() => setPaymentMethod("card")}
            >
              <Image src={"/card.svg"} width={32} height={20} alt="card" />
              Card
            </label>
          </div>

          {/* Paypal */}
          <div>
            <label
              htmlFor="paypal"
              className={`text-sm font-medium flex flex-col items-center justify-center min-h-[120px] w-full rounded-md border-2 p-4 cursor-pointer ${paymentMethod === "paypal"
                ? "border-primary bg-blue-50"
                : "border-muted"
                }`}
              onClick={() => setPaymentMethod("paypal")}
            >
              <Image
                src={"/paypal.svg"}
                width={32}
                height={20}
                alt="paypal"
                className="mb-2"
              />
              Paypal
            </label>
          </div>

          {/* Apple Pay */}
          <div>
            <label
              htmlFor="apple"
              className={`text-sm font-medium flex flex-col items-center justify-center min-h-[120px] w-full rounded-md border-2 p-4 cursor-pointer ${paymentMethod === "apple"
                ? "border-primary bg-gray-100"
                : "border-muted"
                }`}
              onClick={() => setPaymentMethod("apple")}
            >
              <Image src={"/apple.svg"} width={32} height={20} alt="apple" />
              Apple Pay
            </label>
          </div>

          {/* Promo Code */}
          <div>
            <label
              htmlFor="promo"
              className={`text-sm font-medium flex flex-col items-center justify-center min-h-[120px] w-full rounded-md border-2 p-4 cursor-pointer ${paymentMethod === "promo"
                ? "border-primary bg-blue-50"
                : "border-muted"
                }`}
              onClick={() => setPaymentMethod("promo")}
            >
              <Image src={"/voucher.png"} width={32} height={20} alt="promo" />
              Promo Code
            </label>
          </div>
        </div>

        {/* Card Fields */}
        {paymentMethod === "card" && (
          <>
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input id="name" placeholder="First Last" className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="city" className="text-sm font-medium">City</label>
              <input id="city" placeholder="" className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm" />
            </div>

            <div className="grid gap-2">
              <label htmlFor="number" className="text-sm font-medium">Card number</label>
              <input
                id="number"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label htmlFor="month" className="text-sm font-medium">Expires</label>
                <input id="month" maxLength={2} onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); }} placeholder="MM" className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="year" className="text-sm font-medium">Year</label>
                <input id="year" maxLength={4} onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); }} placeholder="YYYY" className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cvc" className="text-sm font-medium">CVC</label>
                <input
                  id="cvc"
                  placeholder="123"
                  maxLength={3}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                  }}
                  className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* PayPal Fields */}
        {paymentMethod === "paypal" && (
          <>
            <div className="grid gap-2">
              <label htmlFor="paypal-name" className="text-sm font-medium">Name</label>
              <input id="paypal-name" placeholder="Full Name" className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="paypal-id" className="text-sm font-medium">PayPal ID (Email)</label>
              <input
                type="email"
                id="paypal-id"
                placeholder="user@paypal.com"
                className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="paypal-country" className="text-sm font-medium">Country</label>
              <input id="paypal-country" placeholder="e.g. India" className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm" />
            </div>
          </>
        )}

        {paymentMethod === "apple" && (
          <>
            <div className="grid gap-2">
              <label htmlFor="apple-name" className="text-sm font-medium">Full Name</label>
              <input id="apple-name" placeholder="Your Name" className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="apple-id" className="text-sm font-medium">Apple ID (Email)</label>
              <input
                type="email"
                id="apple-id"
                placeholder="user@icloud.com"
                className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="apple-phone" className="text-sm font-medium">Phone Number</label>
              <input type="tel" id="apple-phone" placeholder="+91 9876543210" className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm" />
            </div>
          </>
        )}

        {/* Promo Code Field */}
        {paymentMethod === "promo" && (
          <div className="grid gap-2">
            <label htmlFor="promo-code" className="text-sm font-medium">
              Enter Promo Code
            </label>
            <input
              id="promo-code"
              placeholder="PROMO2025"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="flex items-center p-6 pt-0">
        <button
          onClick={handleContinue}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-white shadow hover:bg-primary/90 h-9 px-4 py-2 w-full"
        >
          {loading
            ? "Processing..."
            : paymentMethod === "paypal"
              ? "Pay with PayPal"
              : paymentMethod === "apple"
                ? "Pay with Apple Pay"
                : paymentMethod === "promo"
                  ? "Apply Promo Code"
                  : "Pay with Card"}
        </button>
      </div>

      {message && <p className="text-center mt-2">{message}</p>}
    </div>
  );
}

export default Page;
