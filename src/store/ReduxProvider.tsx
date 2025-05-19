"use client";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { loginSuccess } from "./slices/authSlice";

export const ReduxProvider = (props: React.PropsWithChildren) => {
  // Initialize auth state from localStorage on client
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        // Restore user authentication state
        store.dispatch(loginSuccess(JSON.parse(user)));
      }
    }
  }, []);

  return <Provider store={store}>{props.children}</Provider>;
};