import { useState } from "react";
import { pb } from "./lib/pocketbase";
import { LoginForm } from "./components/LoginForm";
import { SignupForm } from "./components/SignupForm";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { isValid, user } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (!isValid) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
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

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <p>Welcome back {user.name}</p>
      <p>Email: {user.email}</p>

      <button
        onClick={() => pb.authStore.clear()}
        className="mt-2 text-sm underline"
      >
        Log out
      </button>
    </div>
  );
}
