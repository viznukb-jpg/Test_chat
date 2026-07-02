"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/shared/store/useAuthStore';
import Link from 'next/link';
import Cookies from 'js-cookie';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Minimum 6 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setServerError('');
      const { accessToken, refreshToken } = await authApi.login(data);
      
      useAuthStore.setState({ accessToken });
      const user = await authApi.fetchMe();
      
      setAuth(user, accessToken, refreshToken);
      router.push('/');
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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#252542] font-sans p-5">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 w-full max-w-[420px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-slide-up">
        <h1 className="text-white text-3xl font-bold mb-2 text-center">Welcome Back</h1>
        <p className="text-[#a0a0b0] text-sm text-center mb-8">Sign in to continue</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5 flex flex-col">
            <label className="text-[#d1d1e0] text-[13px] font-medium mb-2">Email</label>
            <input 
              {...register('email')} 
              className="bg-black/20 border border-white/10 rounded-xl p-3.5 text-white text-[15px] transition-all duration-200 outline-none placeholder:text-white/30 focus:border-indigo-500 focus:bg-black/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" 
              placeholder="name@example.com"
            />
            {errors.email && <span className="text-red-500 text-xs mt-1.5 animate-shake">{errors.email.message}</span>}
          </div>

          <div className="mb-5 flex flex-col">
            <label className="text-[#d1d1e0] text-[13px] font-medium mb-2">Password</label>
            <input 
              {...register('password')} 
              type="password"
              className="bg-black/20 border border-white/10 rounded-xl p-3.5 text-white text-[15px] transition-all duration-200 outline-none placeholder:text-white/30 focus:border-indigo-500 focus:bg-black/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" 
              placeholder="••••••••"
            />
            {errors.password && <span className="text-red-500 text-xs mt-1.5 animate-shake">{errors.password.message}</span>}
          </div>

          {serverError && <div className="text-red-500 text-xs mt-1.5 mb-4 text-center animate-shake">{serverError}</div>}

          <button 
            type="submit" 
            className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none rounded-xl p-3.5 w-full text-base font-semibold cursor-pointer transition-all duration-200 mt-2 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_#8b5cf6] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <Link href="/register" className="text-[#a0a0b0] text-sm text-center mt-6 block no-underline group">
          Don&apos;t have an account? <span className="text-purple-500 font-medium transition-colors duration-200 group-hover:text-purple-400">Sign Up</span>
        </Link>
        
        <Link href="/" className="text-slate-400 text-sm text-center mt-3 block no-underline">
          ← Stay unauthorized
        </Link>
      </div>
    </div>
  );
};
