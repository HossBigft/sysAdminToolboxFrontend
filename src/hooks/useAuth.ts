import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type {
  UserPublic,
  UserRegister,
  Body_login_login_access_token,
} from "../client/types.gen";
import { loginAccessToken, registerUser } from "../client";
import { readUserMeOptions } from "../client/@tanstack/react-query.gen";
import useCustomToast from "./useCustomToast";

import { AxiosError } from "axios";

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null;
};

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const showToast = useCustomToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<UserPublic>({
    ...readUserMeOptions(),
    queryKey: ["currentUser"],
    enabled: isLoggedIn(),
    retry: (failureCount, error) => {
      if (error?.response?.status === 404 || 403)
        if (failureCount === 2) {
          localStorage.clear();
          navigate({ to: "/login" });
        }
      return failureCount < 3;
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      registerUser({ body: data, throwOnError: true }),
    onSuccess: () => {
      navigate({ to: "/login" });
      showToast(
        "Account created.",
        "Your account has been created successfully.",
        "success"
      );
    },
    onError: (err: AxiosError) => {
      let errDetail = JSON.parse((err.request as any)?.response).detail;

      showToast("Something went wrong.", errDetail, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const login = async (credentials: Body_login_login_access_token) => {
    const response = await loginAccessToken({
      body: credentials,
      throwOnError: true,
    });
    localStorage.setItem("access_token", response.data.access_token);
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" });
    },
    onError: (err: AxiosError) => {
      let errDetail = JSON.parse((err.request as any)?.response).detail;
      if (Array.isArray(errDetail)) {
        errDetail = "Something went wrong";
      }
      setError(errDetail);
    },
  });
  const logout = () => {
    localStorage.removeItem("access_token");
    navigate({ to: "/login" });
  };

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    isLoading,
    error,
    resetError: () => setError(null),
  };
};
export { isLoggedIn };
export default useAuth;
