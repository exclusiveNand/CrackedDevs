import { createContext, useEffect, useState } from "react";
import ChainList from "../../src/json/ChainList.json";

import { useSwitchChain } from "wagmi";

export const ChainContext = createContext();

export const ChainContextProvider = ({ children }) => {
  const [activeChain, setActiveChain] = useState(ChainList[3]);
  const { switchChainAsync } = useSwitchChain();
  const handleChangeChain = async (id) => {
    console.log("Switching chain to:", id);
    try {
      await switchChainAsync({ chainId: id });

      switch (id) {
        case 1:
          setActiveChain(ChainList[0]);
          break;
        case 1030:
          setActiveChain(ChainList[1]);
          break;
        case 5:
          setActiveChain(ChainList[2]);
          break;
        case 71:
          setActiveChain(ChainList[3]);
          break;
        default:
          console.error("Unsupported chain ID:", id);
          break;
      }
    } catch (error) {
      console.error("Error while switching chain:", error);
    }
  };

  return (
    <ChainContext.Provider value={{ activeChain, handleChangeChain }}>
      {children}
    </ChainContext.Provider>
  );
};
