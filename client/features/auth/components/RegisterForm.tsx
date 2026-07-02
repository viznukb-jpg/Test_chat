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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      const { accessToken } = await authApi.register(registerData);
      
      useAuthStore.setState({ accessToken });
      Cookies.set('accessToken', accessToken, { path: '/', expires: 7 });
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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#252542] font-sans p-5">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 w-full max-w-[420px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-slide-up">
        <h1 className="text-white text-3xl font-bold mb-2 text-center">Create Account</h1>
        <p className="text-[#a0a0b0] text-sm text-center mb-8">Join the live conversation</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5 flex flex-col">
            <label className="text-[#d1d1e0] text-[13px] font-medium mb-2">Username</label>
            <input 
              {...register('username')} 
              className="bg-black/20 border border-white/10 rounded-xl p-3.5 text-white text-[15px] transition-all duration-200 outline-none placeholder:text-white/30 focus:border-indigo-500 focus:bg-black/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" 
              placeholder="cool_user"
              type="text" 
            />
            {errors.username && <span className="text-red-500 text-xs mt-1.5 animate-shake">{errors.username.message}</span>}
          </div>

          <div className="mb-5 flex flex-col">
            <label className="text-[#d1d1e0] text-[13px] font-medium mb-2">Email</label>
            <input 
              {...register('email')} 
              className="bg-black/20 border border-white/10 rounded-xl p-3.5 text-white text-[15px] transition-all duration-200 outline-none placeholder:text-white/30 focus:border-indigo-500 focus:bg-black/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" 
              placeholder="name@example.com"
              type="email" 
            />
            {errors.email && <span className="text-red-500 text-xs mt-1.5 animate-shake">{errors.email.message}</span>}
          </div>

          <div className="mb-5 flex flex-col">
            <label className="text-[#d1d1e0] text-[13px] font-medium mb-2">Password</label>
            <input 
              {...register('password')} 
              className="bg-black/20 border border-white/10 rounded-xl p-3.5 text-white text-[15px] transition-all duration-200 outline-none placeholder:text-white/30 focus:border-indigo-500 focus:bg-black/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" 
              placeholder="••••••••"
              type="password" 
            />
            {errors.password && <span className="text-red-500 text-xs mt-1.5 animate-shake">{errors.password.message}</span>}
          </div>

          <div className="mb-5 flex flex-col">
            <label className="text-[#d1d1e0] text-[13px] font-medium mb-2">Confirm Password</label>
            <input 
              {...register('confirmPassword')} 
              className="bg-black/20 border border-white/10 rounded-xl p-3.5 text-white text-[15px] transition-all duration-200 outline-none placeholder:text-white/30 focus:border-indigo-500 focus:bg-black/30 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" 
              placeholder="••••••••"
              type="password" 
            />
            {errors.confirmPassword && <span className="text-red-500 text-xs mt-1.5 animate-shake">{errors.confirmPassword.message}</span>}
          </div>

          {serverError && <div className="text-red-500 text-xs mt-1.5 mb-4 text-center animate-shake">{serverError}</div>}

          <button 
            type="submit" 
            className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none rounded-xl p-3.5 w-full text-base font-semibold cursor-pointer transition-all duration-200 mt-2 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_#8b5cf6] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <Link href="/login" className="text-[#a0a0b0] text-sm text-center mt-6 block no-underline group">
          Already have an account? <span className="text-purple-500 font-medium transition-colors duration-200 group-hover:text-purple-400">Sign In</span>
        </Link>

        <Link href="/" className="text-slate-400 text-sm text-center mt-3 block no-underline">
          ← Stay unauthorized
        </Link>
      </div>
    </div>
  );
};
