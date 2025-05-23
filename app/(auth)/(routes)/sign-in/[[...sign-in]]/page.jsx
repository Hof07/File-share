"use client";  // This is important for React hooks to work in Next.js 13 app directory

import { SignIn, useUser } from "@clerk/nextjs";

export default function SignInPage() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    if (typeof window !== "undefined") {
      window.location.href = "/upload";  // તમે તમારી ફેવરિટ રીડાયરેક્ટ URL મૂકો
    }
    return null;
  }

  return <SignIn path="/sign-in" routing="path" />;
}
