import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useLogin } from "../hooks/useAuth";
import Input from "@/components/ui/Input";
import SubmitButton from "@/components/ui/SubmitButton";

export default function LoginForm() {
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
          navigate({ to: "/me" });
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-3">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      {login.isError && (
        <p className="text-sm text-red-500">{login.error.message}</p>
      )}

      <SubmitButton>Login</SubmitButton>
    </form>
  );
}
