"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/shared/store/useAuthStore';
import styles from '../styles/AuthForm.module.css';
import Link from 'next/link';

const registerSchema = z.object({
  username: z.string().min(3, { message: "Minimum 3 characters" }),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format" }),
  password: z.string().min(6, { message: "Minimum 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setServerError('');
      const { confirmPassword, ...registerData } = data;
      const { accessToken } = await authApi.register(registerData);
      
      useAuthStore.setState({ accessToken });
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`;
      const user = await authApi.fetchMe();
      
      setAuth(user, accessToken);
      router.push('/');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message || 'Registration failed');
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
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join the live conversation</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <input 
              {...register('username')} 
              className={styles.input} 
              placeholder="cool_user"
              type="text" 
            />
            {errors.username && <span className={styles.errorText}>{errors.username.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input 
              {...register('email')} 
              className={styles.input} 
              placeholder="name@example.com"
              type="email" 
            />
            {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input 
              {...register('password')} 
              className={styles.input} 
              placeholder="••••••••"
              type="password" 
            />
            {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input 
              {...register('confirmPassword')} 
              className={styles.input} 
              placeholder="••••••••"
              type="password" 
            />
            {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword.message}</span>}
          </div>

          {serverError && <div className={styles.errorText} style={{marginBottom: 16, textAlign: 'center'}}>{serverError}</div>}

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <Link href="/login" className={styles.link}>
          Already have an account? <span>Sign In</span>
        </Link>

        <Link href="/" className={styles.link} style={{ marginTop: '12px', display: 'block', color: '#94a3b8' }}>
          ← Stay unauthorized
        </Link>
      </div>
    </div>
  );
};
