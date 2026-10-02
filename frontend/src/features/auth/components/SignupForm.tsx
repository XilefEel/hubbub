import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSignup } from "../hooks/useAuth";
import Input from "@/components/ui/Input";
import SubmitButton from "@/components/ui/SubmitButton";

export default function SignupForm() {
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
      { onSuccess: () => navigate({ to: "/me" }) },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-3">
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />

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

      <Input
        type="password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        placeholder="Confirm password"
      />

      {signup.isError && (
        <p className="text-sm text-red-500">{signup.error.message}</p>
      )}

      <SubmitButton>Sign up</SubmitButton>
    </form>
  );
}
