'use client';

import React, { useState } from 'react';
import { useLazyGetUserInfoQuery, useLoginMutation } from '@/services/user.service';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import { setAbility } from '@/store/slices/abilitySlice';

export default function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');
  const [fetchUserInfo] = useLazyGetUserInfoQuery();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    try {
      const data = await login({ username, password }).unwrap();
      const user = await fetchUserInfo({ studentId : username }).unwrap();

      if (!user) {
        console.log('Error', 'User not found');
        return;
      }
      dispatch(setUser({
        ...user.data,
        isAuthenticated: true
      }));
      dispatch(setAbility(data?.data?.role?.permissions || []));
      window.location.href = '/';
    } catch (err: any) {
      setError('Invalid username or password');
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="p-4 shadow-lg rounded" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="block mb-1">Username</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              id="username" 
              name="username"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="block mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded" 
              id="password" 
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-3 flex items-center">
            <input type="checkbox" className="mr-2" id="rememberMe" />
            <label className="text-sm" htmlFor="rememberMe">Remember me</label>
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
          <div className="text-center mt-3">
            <a href="/forgot-password" className="text-blue-500 hover:underline">Forgot password?</a>
          </div>
          <div className="text-center mt-3">
            <span>Don’t have an account? </span>
            <a href="/register" className="text-blue-500 hover:underline">Register</a>
          </div>
        </form>
      </div>
    </div>
  );
}
