"use client";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { setUser } from "./slices/authSlice";

export const ReduxProvider = (props: React.PropsWithChildren) => {

  return <Provider store={store}>{props.children}</Provider>;
};