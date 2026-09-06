import { useState } from "react";
import { pb } from "../lib/pocketbase";
import { useNavigate } from "@tanstack/react-router";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    try {
      await pb.collection("users").authWithPassword(email, password);
      navigate({ to: "/" });
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-3">
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

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        className="rounded bg-teal-500 px-4 py-2 text-white"
      >
        Log in
      </button>
    </form>
  );
}
