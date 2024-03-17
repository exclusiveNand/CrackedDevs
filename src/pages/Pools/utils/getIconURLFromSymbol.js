import getTokenList from "./getTokenList";

const getIconURLFromSymbol = (symbol, activeChainID) => {
  const tokenList = getTokenList(activeChainID);
  const token = tokenList.find((token) => token.symbol === symbol);
  return token.img;
};

export default getIconURLFromSymbol;
