"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/shared/store/useAuthStore";
import styles from "../styles/AuthForm.module.css";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" }),
  password: z.string().min(6, { message: "Minimum 6 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setServerError("");
      const { accessToken } = await authApi.login(data);

      useAuthStore.setState({ accessToken });
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
      const user = await authApi.fetchMe();

      setAuth(user, accessToken);
      router.push("/");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || 'Login failed');
      } else {
        setServerError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              {...register("email")}
              className={styles.input}
              placeholder="name@example.com"
              type="email"
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              {...register("password")}
              className={styles.input}
              placeholder="••••••••"
              type="password"
            />
            {errors.password && (
              <span className={styles.errorText}>
                {errors.password.message}
              </span>
            )}
          </div>

          {serverError && (
            <div
              className={styles.errorText}
              style={{ marginBottom: 16, textAlign: "center" }}
            >
              {serverError}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link href="/register" className={styles.link}>
          Don't have an account? <span>Create one</span>
        </Link>
        
        <Link href="/" className={styles.link} style={{ marginTop: '12px', display: 'block', color: '#94a3b8' }}>
          ← Stay unauthorized
        </Link>
      </div>
    </div>
  );
};
