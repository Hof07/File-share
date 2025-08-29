"use client";

import { SignIn, useUser } from "@clerk/nextjs";

export default function SignInPage() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    if (typeof window !== "undefined") {
      window.location.href = "/upload"; 
    }
    return null;
  }

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/logos.jpg')", 
      }}
    >
      {/* Blur Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      {/* SignIn Box */}
      <div className="relative z-10 p-6 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg">
        <SignIn path="/sign-in" routing="path" />
      </div>
    </div>
  );
}
