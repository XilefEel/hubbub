import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useLogin } from "../../hooks/useAuth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const login = useLogin();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate({ to: "/" });
        },
      },
    );
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

      {login.isError && (
        <p className="text-sm text-red-500">{login.error.message}</p>
      )}

      <button
        type="submit"
        className="rounded bg-teal-500 px-4 py-2 text-white"
      >
        Log in
      </button>
    </form>
  );
}
