import getTokenList from "./getTokenList";

const formattedAmount = (amount, symbol, activeChainID) => {
  const tokenList = getTokenList(activeChainID);
  if (symbol === "pool") return (parseFloat(amount) / 10 ** 18).toFixed(4);
  const token = tokenList.find((token) => token.symbol === symbol);
  if (token) {
    const decimals = token.decimals;
    const formattedAmount = parseFloat(amount) / 10 ** decimals;
    return formattedAmount.toFixed(4);
  }
  return amount;
};

export default formattedAmount;
