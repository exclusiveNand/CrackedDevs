const ethers = require("ethers");
const { computePoolAddress } = require("@uniswap/v3-sdk");
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const Quoter = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const {
  WETH_ADDRESS,
  QUOTER_ADDRESS,
  RPC_URL,
  FACTORY_ADDRESS,
  getPoolInfo,
} = require("./helper");
const { Token } = require("@uniswap/sdk-core");
const ERC20ABI = require("../abi/ERC20.json");

/*
 * Get the price of a token in terms of another token
 * @param {string} tokenIn - address of the token to be swapped
 * @param {string} tokenOut - address of the token to be received
 * @param {number} fee - fee tier of the pool
 * @param {number} amountIn - amount of tokenIn to be swapped
 * @returns {string} - the amount of tokenOut received. Still expressed in decimal places
 */
async function getOutputQuote(tokenIn, tokenOut, fee, amountIn) {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const quoterContract = new ethers.Contract(
    QUOTER_ADDRESS,
    Quoter.abi,
    provider
  );

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    tokenIn,
    tokenOut,
    fee,
    amountIn,
    0
  );
  return quotedAmountOut.toString();
}

module.exports = {
  getOutputQuote,
};

// async function main() {
//   console.log(
//     await getOutputQuote(
//       WETH_ADDRESS,
//       "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
//       3000,
//       ethers.utils.parseEther("1")
//     )
//   );
// }
// main();
