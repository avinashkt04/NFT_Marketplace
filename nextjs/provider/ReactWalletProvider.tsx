import React from 'react';
import { useMetaMask } from '@/context/MetamaskContext';
import {ConnectWallet} from '@/components/ConnectWallet';

export const RequireWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useMetaMask();

  if (!window.ethereum) {
    return <div>No MetaMask found. Please install MetaMask to continue.</div>;
  }

  if (!isConnected) {
    return (
      <div className='flex justify-center items-center flex-col'>
        <p>Please connect your wallet to continue.</p>
        <ConnectWallet />
      </div>
    );
  }

  return <>{children}</>;
};

