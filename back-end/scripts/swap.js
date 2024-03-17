const ethers = require("ethers");
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const {
  abi: SwapRouterAbi,
} = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
const ERC20ABI = require("../abi/ERC20.json");
const {
  Pool,
  Route,
  SwapQuoter,
  computePoolAddress,
  Trade,
  SwapRouter,
} = require("@uniswap/v3-sdk");

const {
  WETH_ADDRESS,
  QUOTER_ADDRESS,
  RPC_URL,
  SWAP_ROUTER_ADDRESS,
  getBalanceReadable,
  getPoolInfo,
  FACTORY_ADDRESS,
  QUOTER2_ADDRESS,
  getTokenTransferApproval,
  getWalletAddress,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  fromReadableAmount,
  DAI_ADDRESS,
  USDC_ADDRESS,
} = require("./helper");
const {
  Token,
  CurrencyAmount,
  TradeType,
  Percent,
} = require("@uniswap/sdk-core");
const { getOutputQuote } = require("./quoter");

/*
 * Get params for swapping tokenIn for tokenOut with a given amountIn
 * @param {string} tokenIn - address of the token to be swapped
 * @param {string} tokenOut - address of the token to be received
 * @param {number} fee - fee tier of the pool
 * @param {number} amountIn - amount of tokenIn to be swapped (expressed in decimal places) (blank if swapType is 1)
 * @param {number} amountOutMinimum - minimum amount of tokenOut to be received (blank if swapType is 1)
 * @param {number} amountOut - amount of tokenOut to be received (expressed in decimal places) (blank if swapType is 0)
 * @param {number} amountInMaximum - maximum amount of tokenIn needed to complete the swap (blank if swapType is 0)
 * @returns {string} - the amount of tokenOut received. Still expressed in decimal places
 */
async function swap(
  tokenIn,
  tokenOut,
  fee,
  amountIn,
  amountOutMinimum,
  amountOut,
  amountInMaximum,
  swapType
) {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const chainId = (await provider.getNetwork()).chainId;
  const tokenInContract = new ethers.Contract(tokenIn, ERC20ABI, provider);
  const tokenOutContract = new ethers.Contract(tokenOut, ERC20ABI, provider);
  const tokenA = new Token(
    chainId,
    tokenIn,
    await tokenInContract.callStatic.decimals(),
    await tokenInContract.callStatic.symbol()
  );
  const tokenB = new Token(
    chainId,
    tokenOut,
    await tokenOutContract.callStatic.decimals(),
    await tokenOutContract.callStatic.symbol()
  );

  const currentPoolAddress = computePoolAddress({
    factoryAddress: FACTORY_ADDRESS,
    tokenA: tokenA,
    tokenB: tokenB,
    fee: fee,
  });

  const poolContract = new ethers.Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    provider
  );

  const poolInfo = await getPoolInfo(poolContract);
  const pool = new Pool(
    tokenA,
    tokenB,
    fee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  );

  const swapRoute = new Route([pool], tokenA, tokenB);
  let uncheckedTrade;
  if (swapType === 0) {
    const amountOut = await getOutputQuote(tokenIn, tokenOut, fee, amountIn);
    if (BigInt(amountOut.toString()) < BigInt(amountOutMinimum.toString())) {
      throw new Error("Insufficient output amount");
    }
    uncheckedTrade = Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(tokenA, amountIn),
      outputAmount: CurrencyAmount.fromRawAmount(tokenB, amountOut),
      tradeType: TradeType.EXACT_INPUT,
    });
    await getTokenTransferApproval(tokenA, amountIn);
  } else {
    const amountIn = await getOutputQuote(tokenOut, tokenIn, fee, amountOut);
    if (BigInt(amountIn.toString()) > BigInt(amountInMaximum.toString())) {
      throw new Error("Insufficient input amount");
    }
    uncheckedTrade = Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(tokenA, amountIn),
      outputAmount: CurrencyAmount.fromRawAmount(tokenB, amountOut),
      tradeType: TradeType.EXACT_OUTPUT,
    });
    await getTokenTransferApproval(
      tokenA,
      BigInt(
        (BigInt(uncheckedTrade.inputAmount.quotient.toString()) * BigInt(101)) /
          BigInt(100)
      ).toString()
    );
  }

  const options = {
    slippageTolerance: new Percent(100, 10_000), // 1%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
  };
  const methodParameters = SwapRouter.swapCallParameters(
    [uncheckedTrade],
    options
  );

  const tx = {
    data: methodParameters.calldata,
    to: SWAP_ROUTER_ADDRESS,
    value: methodParameters.value,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  };

  return tx;
}

async function main() {
  // const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  // console.log("Before balance: ");
  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // await wallet.sendTransaction({
  //   to: WETH_ADDRESS,
  //   value: ethers.utils.parseEther("10"),
  // });
  // await swap(
  //   WETH_ADDRESS,
  //   USDC_ADDRESS, // USDC
  //   3000,
  //   ethers.utils.parseEther("0.1"),
  //   0,
  //   0,
  //   0,
  //   0
  // );

  await swap(
    WETH_ADDRESS,
    USDC_ADDRESS, // USDC
    3000,
    0,
    0,
    ethers.utils.parseUnits("10000", 6),
    ethers.utils.parseEther("100"),
    1
  );

  await swap(
    WETH_ADDRESS,
    DAI_ADDRESS,
    3000,
    0,
    0,
    ethers.utils.parseUnits("10000", 18),
    ethers.utils.parseEther("100"),
    1
  );
}
// main();

module.exports = { swap };
