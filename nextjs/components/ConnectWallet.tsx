"use client";

import React, { useState, useEffect } from "react";
import { Button, Tooltip } from "@nextui-org/react";
import { useMetaMask } from "@/context/MetamaskContext";

export const ConnectWallet = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const { address, provider, isConnected, connectWallet } = useMetaMask();

  useEffect(() => {
    const fetchAddress = async () => {
      if (address && provider) {
        const trimmedAddress = address.slice(0, 6) + "..." + address.slice(-6);
        setUserAddress(trimmedAddress);
      }
    };
    fetchAddress();
  }, [isConnected]);

  const renderButton = () => (
    <Button
      color="primary"
      onClick={connectWallet}
      disabled={isConnected}
      className="md:text-lg"
    >
      {isConnected ? userAddress : "Connect Wallet"}
    </Button>
  );

  return (
    <>
      {isConnected ? (
        <Tooltip content={address}>{renderButton()}</Tooltip>
      ) : (
        renderButton()
      )}
    </>
  );
};
