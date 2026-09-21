import { useEffect, useState } from "react";

import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { pb } from "../../../lib/pocketbase";
import type { User } from "../../../lib/types";

function invalidateUserDependents(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["server_members"] });
  queryClient.invalidateQueries({ queryKey: ["messages"] });
  queryClient.invalidateQueries({ queryKey: ["reactions"] });
}

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

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to update avatar");

      const formData = new FormData();
      formData.append("avatar", file);

      return await pb.collection("users").update(userId, formData);
    },
    onSuccess: () => invalidateUserDependents(queryClient),
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to remove avatar");

      return await pb.collection("users").update(userId, { avatar: "" });
    },
    onSuccess: () => invalidateUserDependents(queryClient),
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to update username");

      return await pb.collection("users").update(userId, { name });
    },
    onSuccess: () => invalidateUserDependents(queryClient),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      oldPassword,
      password,
      passwordConfirm,
    }: {
      oldPassword: string;
      password: string;
      passwordConfirm: string;
    }) => {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error("Must be logged in to update username");

      if (password !== passwordConfirm) {
        throw new Error("Passwords do not match");
      }

      return await pb.collection("users").update(userId, {
        oldPassword,
        password,
        passwordConfirm,
      });
    },
  });
}
