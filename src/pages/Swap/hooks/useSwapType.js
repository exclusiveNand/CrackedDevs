import { useState } from "react";

const useSwapType = () => {
  const [swapType, setSwapType] = useState("a/b-x/y");

  return {
    swapType,
    setSwapType,
  };
};

export default useSwapType;
