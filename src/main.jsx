import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./Routes";
import "./main.scss";
import { WagmiProvider } from "wagmi";
import { WagmiConfig } from "./wagmiConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChainContextProvider } from "./Contexts/ChainContext";
import { SignerContextProvider } from "./Contexts/SignerContext";
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <WagmiProvider config={WagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <ChainContextProvider>
        <SignerContextProvider>
          <RouterProvider router={router} />
        </SignerContextProvider>
      </ChainContextProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
