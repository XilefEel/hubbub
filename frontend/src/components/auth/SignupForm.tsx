import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSignup } from "../../hooks/useAuth";

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const navigate = useNavigate();
  const signup = useSignup();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    signup.mutate(
      { username, email, password, passwordConfirm },
      { onSuccess: () => navigate({ to: "/" }) },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-3">
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="rounded border px-3 py-2"
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="rounded border px-3 py-2"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="rounded border px-3 py-2"
      />

      <input
        type="password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        placeholder="Confirm password"
        className="rounded border px-3 py-2"
      />

      {signup.isError && (
        <p className="text-sm text-red-500">{signup.error.message}</p>
      )}

      <button
        type="submit"
        className="rounded bg-teal-500 px-4 py-2 text-white"
      >
        Sign up
      </button>
    </form>
  );
}
