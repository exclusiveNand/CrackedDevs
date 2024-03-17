const { URL } = require("./helper");
const axios = require("axios");

async function getPriceOfTokenUSD(tokenAddress) {
  const query = `{
	token(id:"${tokenAddress}"){
    derivedETH
  }
  bundles {
    ethPriceUSD
  }
}`;
  const result = await axios.post(URL, { query });
  const ethUSD = result.data.data.bundles[0].ethPriceUSD;
  const derivedETH = result.data.data.token.derivedETH;
  const priceUSD = ethUSD * derivedETH;
  return priceUSD;
}

getPriceOfTokenUSD("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599").then(
  (result) => {
    console.log(result);
  }
);
module.exports = { getPriceOfTokenUSD };
