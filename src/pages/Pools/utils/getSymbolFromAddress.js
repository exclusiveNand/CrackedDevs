import getTokenList from "./getTokenList";

const getSymbolFromAddress = (tokenAddress, activeChainID) => {
  const tokenList = getTokenList(activeChainID);
  const token = tokenList.find((token) => token.address === tokenAddress);
  return token.symbol;
};

export default getSymbolFromAddress;
