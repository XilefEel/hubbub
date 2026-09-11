import { useEffect, useState } from "react";
import { pb } from "../lib/pocketbase";
import type { User } from "../lib/types";
import { useMutation } from "@tanstack/react-query";

export function useAuth() {
  const [isValid, setIsValid] = useState(pb.authStore.isValid);
  const [user, setUser] = useState<User | null>(
    pb.authStore.record as User | null,
  );

  useEffect(() => {
    return pb.authStore.onChange(() => {
      setIsValid(pb.authStore.isValid);
      setUser(pb.authStore.record as User | null);
    });
  }, []);

  return { isValid, user };
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return await pb.collection("users").authWithPassword(email, password);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async ({
      username,
      email,
      password,
      passwordConfirm,
    }: {
      username: string;
      email: string;
      password: string;
      passwordConfirm: string;
    }) => {
      if (password !== passwordConfirm) {
        throw new Error("Passwords do not match");
      }

      await pb.collection("users").create({
        name: username,
        email,
        password,
        passwordConfirm,
      });

      await pb.collection("users").authWithPassword(email, password);
    },
  });
}
