const TokenList = require("./v2/CFXTestnetTokenList.json");
const { ethers } = require("ethers");

const { FACTORY_ADDRESS, WETH_ADDRESS } = require("./v2/index");
const FACTORY_V2_ABI = require("./v2/ABI/factory_v2_abi.json");
const { getProvider } = require("./scripts/helper");

const provider = getProvider();
const factoryContract = new ethers.Contract(
  FACTORY_ADDRESS,
  FACTORY_V2_ABI,
  provider
);

for (let i = 0; i < TokenList.length; i++) {
  const token0 =
    TokenList[i].ticker !== "CFX" ? TokenList[i].address : WETH_ADDRESS;
  for (let j = i + 1; j < TokenList.length; j++) {
    const token1 =
      TokenList[i].ticker !== "CFX" ? TokenList[j].address : WETH_ADDRESS;
    factoryContract.callStatic
      .getPair(token0, token1)
      .then((pairAddress) => {
        if (pairAddress !== ethers.constants.AddressZero) {
          console.log({ token0, token1, pairAddress });
        }
      })
      .catch((err) => {});
  }
}
