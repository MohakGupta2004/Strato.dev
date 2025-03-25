import '@rainbow-me/rainbowkit/styles.css';
import {
  AuthenticationStatus,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import { createSiweMessage } from 'viem/siwe';
import { useState, useMemo, useEffect, ReactNode } from 'react';

const config = getDefaultConfig({
  appName: 'ai-agent',
  projectId: 'YOUR_PROJECT_ID',
  chains: [sepolia],
});

const AuthAPI = import.meta.env.VITE_API_URL;
const queryClient = new QueryClient();

interface WalletProviderProps {
  children: ReactNode;
}

const Wallet = ({ children }: WalletProviderProps) => {
  const [authStatus, setAuthStatus] = useState<AuthenticationStatus>("loading");

  // 🔹 Fetch user session on page load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Checking session...");
        const response = await fetch(`${AuthAPI}/wallet/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch user session");

        const { address } = await response.json();
        console.log("User Address:", address);
        setAuthStatus("authenticated");
      } catch (error) {
        console.error("Auth error:", error);
        setAuthStatus("unauthenticated");
      }
    };

    fetchUser();
    window.addEventListener("focus", fetchUser);
    return () => window.removeEventListener("focus", fetchUser);
  }, []);

  // 🔹 RainbowKit Authentication Adapter
  const authAdapter = useMemo(() => {
    return createAuthenticationAdapter({
      getNonce: async () => {
        try {
          const res = await fetch(`${AuthAPI}/wallet/nonce`, {
            method: "GET",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Failed to fetch nonce");
          const { nonce } = await res.json();
          return nonce;
        } catch (error) {
          console.error("Nonce error:", error);
          return "";
        }
      },
      createMessage: ({ nonce, address, chainId }) => {
        return createSiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in with Ethereum to the app.",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce,
        });
      },
      verify: async ({ message, signature }) => {
        try {
          const res = await fetch(`${AuthAPI}/wallet/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, signature }),
            credentials: "include",
          });

          if (!res.ok) throw new Error("Signature verification failed");

          setAuthStatus("authenticated");
          return true;
        } catch (error) {
          console.error("Verification error:", error);
          return false;
        }
      },
      signOut: async () => {
        try {
          await fetch(`${AuthAPI}/wallet/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Logout error:", error);
        }
        setAuthStatus("unauthenticated");
      },
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider adapter={authAdapter} status={authStatus}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Wallet;
