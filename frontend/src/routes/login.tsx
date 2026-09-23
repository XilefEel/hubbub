import LoginForm from "@/features/auth/components/LoginForm";
import SignupForm from "@/features/auth/components/SignupForm";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      {showSignup ? <SignupForm /> : <LoginForm />}

      <button
        onClick={() => setShowSignup(!showSignup)}
        className="mt-4 text-sm text-teal-500 underline"
      >
        {showSignup
          ? "Already have an account? Log in"
          : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}
