import { useContext, useEffect, useState } from "react";
import CFXTokenList from "../../../json/CFXTokenList.json";
import ETHTokenList from "../../../json/ETHTokenList.json";
import CFXTestnetTokenList from "../../../json/CFXTestnetTokenList.json";
import GoerliTokenList from "../../../json/GoerliTokenList.json";
import { SignerContext } from "../../../Contexts/SignerContext";
import ERC20ABI from "../../../abi/ERC20ABI.json";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

const useTokens = (activeChainID) => {
  const [pair_Percent, setPair_Percent] = useState(0);
  const [debouncedPair_Percent, setDebouncedPair_Percent] = useState(0);
  const [tokenE_Amount, setTokenE_Amount] = useState(undefined);
  const [debouncedTokenE_Amount, setDebouncedTokenE_Amount] =
    useState(undefined);
  const [estimateTokenEFunction, setEstimateTokenEFunction] = useState(
    () => () => {}
  );
  const [tokenX_Amount, setTokenX_Amount] = useState(undefined);
  const [tokenY_Amount, setTokenY_Amount] = useState(undefined);

  const [tokenA_ListID, setTokenA_ListID] = useState(undefined);
  const [tokenB_ListID, setTokenB_ListID] = useState(undefined);
  const [tokenE_ListID, setTokenE_ListID] = useState(undefined);
  const [tokenX_ListID, setTokenX_ListID] = useState(undefined);
  const [tokenY_ListID, setTokenY_ListID] = useState(undefined);
  const [tokenE_Balance, setTokenE_Balance] = useState(undefined);
  const [estimateFunction, setEstimateFunction] = useState(() => () => {});

  const LP_AGGREGATOR_ADDRESS = import.meta.env.VITE_LP_AGGREGATOR_ADDRESS;

  const { signer } = useContext(SignerContext);
  const { address } = useAccount();

  useEffect(() => {
    setTokenE_ListID(undefined);
    setTokenX_ListID(undefined);
    setTokenY_ListID(undefined);
    setPair_Percent(0);
    setTokenE_Amount(undefined);
    setTokenX_Amount(undefined);
    setTokenY_Amount(undefined);
  }, [activeChainID]);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      const tokenE = getToken("tokenE");
      if (tokenE.address) {
        const balanceOfContract = new ethers.Contract(
          tokenE.address,
          ERC20ABI,
          signer
        );
        const balance = await balanceOfContract.balanceOf(address);
        setTokenE_Balance((balance / 10 ** 18).toString().slice(0, 8));
      }
    };
    fetchTokenBalance();
  }, [tokenE_ListID]);

  const changeAmount = (value, token, estimateFunction) => {
    switch (token) {
      case "tokenE":
        setTokenE_Amount(value);
        setEstimateTokenEFunction(() => estimateFunction);
        break;
      case "tokenX":
        setTokenX_Amount(value);
        break;
      case "tokenY":
        setTokenY_Amount(value);
        break;
      default:
        break;
    }
  };

  const loadToken = ({ tokenASymbol, tokenBSymbol }) => {
    const tokenList = getTokenList();
    const tokenA = tokenList.find((token) => token.symbol === tokenASymbol);
    const tokenA_ID = tokenList.findIndex(
      (token) => token.symbol === tokenASymbol
    );
    const tokenB = tokenList.find((token) => token.symbol === tokenBSymbol);
    const tokenB_ID = tokenList.findIndex(
      (token) => token.symbol === tokenBSymbol
    );
    if (tokenA) {
      setTokenA_ListID(tokenA_ID);
    }
    if (tokenB) {
      setTokenB_ListID(tokenB_ID);
    }
  };

  const onAmountChange = (e, token, estimateFunction) => {
    const value = e.target.value;
    const reg = /^-?\d*(\.\d*)?$/;
    if (value.match(reg)) {
      changeAmount(value, token, estimateFunction);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTokenE_Amount(tokenE_Amount);
      console.log(tokenE_Amount);
    }, 1000);
    return () => clearTimeout(timer);
  }, [tokenE_Amount, 1000]);

  useEffect(() => {
    console.log("estimateTokenEFunction: ", estimateTokenEFunction);
    if (estimateTokenEFunction) {
      estimateTokenEFunction();
    }
  }, [debouncedTokenE_Amount]);

  const onPairPercentChange = async (newValue, estimate) => {
    setPair_Percent(newValue);
    setEstimateFunction(() => estimate);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPair_Percent(pair_Percent);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pair_Percent, 1000]);

  useEffect(() => {
    console.log("estimateFunction: ", estimateFunction);
    if (estimateFunction) {
      estimateFunction();
    }
  }, [debouncedPair_Percent]);

  const handleChangeToken = (id, token) => {
    switch (token) {
      case "tokenA":
        setTokenA_ListID(id);
        break;
      case "tokenB":
        setTokenB_ListID(id);
        break;
      case "tokenE":
        setTokenE_ListID(id);
        break;
      case "tokenX":
        setTokenX_ListID(id);
        break;
      case "tokenY":
        setTokenY_ListID(id);
        break;
      default:
        break;
    }
  };

  const getTokenList = () => {
    switch (activeChainID) {
      case 1:
        return ETHTokenList;
      case 5:
        return GoerliTokenList;
      case 1030:
        return CFXTokenList;
      case 71:
        return CFXTestnetTokenList;
    }
  };

  const getToken = (token) => {
    const tokenList = getTokenList();
    switch (token) {
      case "tokenA":
        if (tokenA_ListID === undefined) return { symbol: "Select Token" };
        return tokenList[tokenA_ListID];
      case "tokenB":
        if (tokenB_ListID === undefined) return { symbol: "Select Token" };
        return tokenList[tokenB_ListID];
      case "tokenE":
        if (tokenE_ListID === undefined) return { symbol: "Select Token" };
        return tokenList[tokenE_ListID];
      case "tokenX":
        if (tokenX_ListID === undefined) return { symbol: "Select Token" };
        return tokenList[tokenX_ListID];
      case "tokenY":
        if (tokenY_ListID === undefined) return { symbol: "Select Token" };
        return tokenList[tokenY_ListID];
    }
  };

  return {
    pair_Percent,
    debouncedPair_Percent,
    tokenE_Amount,
    tokenX_Amount,
    tokenY_Amount,
    onAmountChange,
    getToken,
    handleChangeToken,
    onPairPercentChange,
    getTokenList,
    loadToken,
    tokenE_Balance,
  };
};

export default useTokens;
