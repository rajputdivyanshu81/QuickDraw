'use client';

import { SignIn, SignUp } from "@clerk/nextjs";

export function AuthPage({ isSignin }: { 
  isSignin: boolean 
}) {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      {isSignin ? (
        <SignIn routing="path" path="/signin" fallbackRedirectUrl="/" />
      ) : (
        <SignUp routing="path" path="/signup" fallbackRedirectUrl="/" />
      )}
    </div>
  );
}
