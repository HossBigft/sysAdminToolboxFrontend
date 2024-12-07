import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type {
  UserPublic,
  UserRegister,
  RegisterUserError,
  Body_login_login_access_token,
  LoginAccessTokenError,
} from "../client/types.gen";
import { loginAccessToken, registerUser } from "../client";
import {
  readUserMeOptions,
  readUsersQueryKey,
} from "../client/@tanstack/react-query.gen";
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
  });
  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) => registerUser({ body: data }),

    onSuccess: () => {
      navigate({ to: "/login" });
      showToast(
        "Account created.",
        "Your account has been created successfully.",
        "success"
      );
    },
    onError: (err: RegisterUserError) => {
      let errDetail = (err.detail as any)?.detail;

      if (err instanceof AxiosError) {
        errDetail = err.message;
      }

      showToast("Something went wrong.", errDetail, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const login = async (credentials: Body_login_login_access_token) => {
    try {
      const response = await loginAccessToken({ body: credentials });
      if (response.data) {
        localStorage.setItem("access_token", response.data.access_token);
      } else {
        throw new Error("No data returned in response");
      }
    } catch (error) {
      console.error(
        "Error logging in:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" });
    },
    onError: (err: LoginAccessTokenError) => {
      let errDetail = (err.detail as any)?.detail;

      if (err instanceof AxiosError) {
        errDetail = err.message;
      }

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
