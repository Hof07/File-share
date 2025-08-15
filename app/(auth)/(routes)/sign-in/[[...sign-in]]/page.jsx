"use client";

import { SignIn, useUser } from "@clerk/nextjs";

export default function SignInPage() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    if (typeof window !== "undefined") {
      window.location.href = "/upload"; // તમારી redirect URL
    }
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <SignIn path="/sign-in" routing="path" />
    </div>
  );
}
