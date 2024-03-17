import { createContext, useContext, useEffect, useState } from "react";
import {
  useAccount,
  useAccountEffect,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { ChainContext } from "./ChainContext";
import { ethers } from "ethers";

export const SignerContext = createContext();

export const SignerContextProvider = ({ children }) => {
  const [signerAddress, setSignerAddress] = useState(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { activeChain } = useContext(ChainContext);
  const { switchChainAsync } = useSwitchChain();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const handleConnectButton = async () => {
    if (!address) {
      try {
        await connectAsync({ connector: connectors[0] });
        await switchChainAsync({ chainId: activeChain.chainID });
      } catch (error) {
        console.error("Error while connecting or switching chain:", error);
      }
    } else {
      disconnect();
    }
  };

  return (
    <SignerContext.Provider
      value={{
        handleConnectButton,
        signer,
        provider,
      }}
    >
      {children}
    </SignerContext.Provider>
  );
};
