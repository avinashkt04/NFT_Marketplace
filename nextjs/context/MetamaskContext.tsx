"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { ethers } from "ethers";

import { toast } from "react-toastify";

type MetamaskContextType = {
  provider: ethers.BrowserProvider | null;
  address: string | null;
  signer: ethers.JsonRpcSigner | null;
  connectWallet: () => Promise<void>;
  isConnected: boolean;
  chainId: number | null;
};

const MetamaskContext = createContext<MetamaskContextType | undefined>(
  undefined,
);

export const MetamaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum as any));
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      console.log("No ethereum provider");
      return;
    }

    const providerInstance = new ethers.BrowserProvider(window.ethereum as any);
    const signerInstance = await providerInstance.getSigner();
    const chainId = await providerInstance
      .getNetwork()
      .then((network) => network.chainId);
    const address = await signerInstance.getAddress();

    setProvider(providerInstance);
    setSigner(signerInstance);
    setIsConnected(true);
    setChainId(Number(chainId));
    setAddress(address);

    toast.success(
      chainId?.toString() === "31337"
        ? "Hardhat Network Detected"
        : "Sepolia Network Detected",
    );
  };

  return (
    <MetamaskContext.Provider
      value={{ provider, address, connectWallet, isConnected, chainId, signer }}
    >
      {children}
    </MetamaskContext.Provider>
  );
};

export const useMetaMask = () => {
  const context = useContext(MetamaskContext);
  if (!context) {
    throw new Error("useMetaMask must be used within a MetamaskProvider");
  }
  return context;
};
