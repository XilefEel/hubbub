import { useState } from "react";
import { pb } from "../../lib/pocketbase";
import { useNavigate } from "@tanstack/react-router";

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await pb.collection("users").create({
        name: username,
        email,
        password,
        passwordConfirm,
      });

      await pb.collection("users").authWithPassword(email, password);
      navigate({ to: "/" });
    } catch (err) {
      console.error(err);
      setError("Signup failed");
    }
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

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        className="rounded bg-teal-500 px-4 py-2 text-white"
      >
        Sign up
      </button>
    </form>
  );
}
