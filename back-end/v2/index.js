const { BigNumber, Contract, Wallet, constants, ethers } = require("ethers");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
const { Token } = require("@uniswap/sdk-core");

const ERC20_ABI = require("./ABI/abi.json");
const { getProvider } = require("../scripts/helper");

const ROUTER_ADDRESS = "0x873789aaf553fd0b4252d0d2b72c6331c47aff2e";
const FACTORY_ADDRESS = "0x36b83e0d41d1dd9c73a006f0c1cbc1f096e69e34";
const WETH_ADDRESS = "0x2ed3dddae5b2f321af0806181fbfa6d049be47d8";
const LP_AGGREGATOR_ADDRESS = "0xff433f6cdfddcd8df4d0fe89a362f47cd5d2d1e5";
const ROUTER_V2_ABI = require("./ABI/router_v2_abi.json");
const FACTORY_V2_ABI = require("./ABI/factory_v2_abi.json");
const { DENOMINATOR } = require("../scripts/LP_Helper");
const { abi: LPAggreatorABI } = require("./ABI/LPAggreator.json");

const ROUTER_INTERFACE = new ethers.utils.Interface(ROUTER_V2_ABI);

function afterRemoveDecimals(amount, decimals) {
  const divisor = ethers.utils.parseUnits("1", decimals);
  const amountString = amount.toString();
  const divided = parseFloat(amountString) / parseFloat(divisor.toString());
  const formatted = divided.toFixed(10); // Adjust the number of decimal places as needed
  return formatted;
}

function getRouterContract() {
  const provider = getProvider();
  const router = new Contract(ROUTER_ADDRESS, routerArtifact.abi, provider);
  return router;
}

function buyTokenWithETH(tokenAddress, recipient) {
  const params = {
    amountOutMin: 0,
    path: [WETH_ADDRESS, tokenAddress],
    to: recipient,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };
  return ROUTER_INTERFACE.encodeFunctionData("swapExactETHForTokens", [params]);
}

function sellTokenForETH(tokenAmount, recipient) {
  const params = {
    amountIn: tokenAmount,
    amountOutMin: 0,
    path: [tokenAddress, WETH_ADDRESS],
    to: recipient,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };
  return ROUTER_INTERFACE.encodeFunctionData("swapExactTokensForETH", [params]);
}

function swapTokenForToken(amountIn, tokenIn, tokenOut) {
  const params = {
    amountIn,
    amountOutMin: 0,
    path: [tokenIn, tokenOut],
    to: recipient,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  return ROUTER_INTERFACE.encodeFunctionData("swapExactTokensForTokens", [
    params,
  ]);
}

function addLiquidity(
  tokenA,
  tokenB,
  amountADesired,
  amountBDesired,
  recipient
) {
  const params = {
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired,
    amountAMin: 0,
    amountBMin: 0,
    to: recipient,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  return ROUTER_INTERFACE.encodeFunctionData("addLiquidity", [params]);
}

function addLiquidityETH(token, amountTokenDesired, recipient) {
  const params = {
    token,
    amountTokenDesired,
    amountTokenMin: 0,
    amountETHMin: 0,
    to: recipient,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };
  return ROUTER_INTERFACE.encodeFunctionData("addLiquidityETH", [params]);
}

async function removeLiquidity(
  tokenA,
  tokenB,
  removePercent,
  sender,
  recipient,
  isEncoded = true
) {
  const provider = getProvider();
  const factory = new Contract(FACTORY_ADDRESS, factoryArtifact.abi, provider);
  const pairAddress = await factory.callStatic.getPair(tokenA, tokenB);
  const pairContract = new Contract(pairAddress, ERC20_ABI, provider);
  const currentLiquidity = await pairContract.callStatic.balanceOf(sender);
  const liquidityToRemove =
    (BigInt(currentLiquidity.toString()) * BigInt(removePercent * 1_000)) /
    BigInt(DENOMINATOR * 1_000);

  const params = {
    tokenA,
    tokenB,
    liquidity: liquidityToRemove.toString(),
    amountAMin: 0,
    amountBMin: 0,
    to: recipient,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };
  if (!isEncoded) {
    return params;
  }
  return ROUTER_INTERFACE.encodeFunctionData("removeLiquidity", [params]);
}

async function removeLiquidityETH(token, removePercent, recipient) {
  const provider = getProvider();
  const factory = new Contract(FACTORY_ADDRESS, factoryArtifact.abi, provider);
  const pairAddress = await factory.callStatic.getPair(WETH_ADDRESS, token);
  const pairContract = new Contract(pairAddress, pairArtifact.abi, provider);
  const currentLiquidity = await pairContract.balanceOf(secret.walletAddress);
  const liquidityToRemove =
    BigInt(currentLiquidity.toString()) *
    (BigInt(removePercent * 1_000) / BigInt(DENOMINATOR * 1_000));
  const params = {
    token,
    liquidity: liquidityToRemove,
    amountTokenMin: 0,
    amountETHMin: 0,
    to: recipient,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  return ROUTER_INTERFACE.encodeFunctionData(
    "removeLiquidityETHSupportingFeeOnTransferTokens",
    [params]
  );
}

async function swapTokenForLP(token, tokenAdd, amount, recipient) {
  return "Not implemented";
}

async function swapLPForLP(tokenRemove, tokenAdd, removePercent, recipient) {
  return "Not implemented";
}

async function swapLPQuote(tokenRemove, removePercent, tokenAdd, recipient) {
  return {
    amount0Expected: "0",
    amount1Expected: "0",
  };
}

async function getUserPool(walletAddress) {
  const provider = getProvider();
  const pairList = require("./pairList.json");

  const poolBalancePromises = [];
  const token0BalancePromises = [];
  const token1BalancePromises = [];
  const totalSupplyPromises = [];

  for (let i = 0; i < pairList.length; i++) {
    const { token0, token1, pairAddress } = pairList[i];
    const pairContract = new Contract(pairAddress, pairArtifact.abi, provider);
    const token0Contract = new Contract(token0, ERC20_ABI, provider);
    const token1Contract = new Contract(token1, ERC20_ABI, provider);

    poolBalancePromises.push(pairContract.callStatic.balanceOf(walletAddress));
    token0BalancePromises.push(
      token0Contract.callStatic.balanceOf(pairAddress)
    );
    token1BalancePromises.push(
      token1Contract.callStatic.balanceOf(pairAddress)
    );
    totalSupplyPromises.push(pairContract.callStatic.totalSupply());
  }

  const [poolBalances, token0Balances, token1Balances, totalSupplies] =
    await Promise.all([
      Promise.all(poolBalancePromises),
      Promise.all(token0BalancePromises),
      Promise.all(token1BalancePromises),
      Promise.all(totalSupplyPromises),
    ]);

  const pools = [];
  for (let i = 0; i < pairList.length; i++) {
    if (poolBalances[i].toString() === "0") {
      continue;
    }
    const A = BigInt(1_000_000_000_000) * BigInt(poolBalances[i].toString());
    const B = BigInt(totalSupplies[i].toString());
    const C = parseFloat((A / B).toString()) / 10_000_000_000;

    const A0 =
      (BigInt((10_000_000_000 * C).toFixed(0)) *
        BigInt(token0Balances[i].toString())) /
      BigInt(1_000_000_000_000);
    const A1 =
      (BigInt((10_000_000_000 * C).toFixed(0)) *
        BigInt(token1Balances[i].toString())) /
      BigInt(1_000_000_000_000);
    console.log(A, B, C);
    console.log(i, A0, A1);

    pools.push({
      token0: pairList[i].token0,
      token1: pairList[i].token1,
      pairAddress: pairList[i].pairAddress,
      poolBalance: poolBalances[i].toString(),
      token0Pooled: A0.toString(),
      token1Pooled: A1.toString(),
      poolSharePercent: C,
    });
  }
  // const pool = {
  //   token0: "",
  //   token1: "",
  //   poolBalance: "",
  //   token0Pooled: "",
  //   token1Pooled: "",
  //   poolSharePercent: 1,
  // };
  return pools;
}

async function getSwapParams(
  tokenA,
  tokenB,
  removePercent,
  tokenX,
  tokenY,
  sender,
  isEncoded
) {
  const removeParams = await removeLiquidity(
    tokenA,
    tokenB,
    removePercent,
    sender,
    LP_AGGREGATOR_ADDRESS,
    false
  );

  const addParams = {
    tokenA: tokenX,
    tokenB: tokenY,
    amountADesired: 0,
    amountBDesired: 0,
    amountAMin: 0,
    amountBMin: 0,
    to: LP_AGGREGATOR_ADDRESS,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  if (isEncoded === "false") {
    console.log("getSwapParamsaaaaaa", { removeParams, addParams });

    return { to: LP_AGGREGATOR_ADDRESS, removeParams, addParams };
  }
  const LP_Interface = new ethers.utils.Interface(LPAggreatorABI);
  const data = LP_Interface.encodeFunctionData("swapLP", [
    removeParams,
    addParams,
  ]);
  return { to: LP_AGGREGATOR_ADDRESS, data };
}

async function getAllowance(token, owner, spender = LP_AGGREGATOR_ADDRESS) {
  const provider = getProvider();
  const tokenContract = new Contract(token, ERC20_ABI, provider);
  const allowance = await tokenContract.callStatic.allowance(owner, spender);
  return allowance.toString();
}

function getTokenToLPParams(
  tokenIn,
  amountIn,
  tokenA,
  tokenB,
  sender,
  isEncoded
) {
  const addParams = {
    tokenA,
    tokenB,
    amountADesired: 0,
    amountBDesired: 0,
    amountAMin: 0,
    amountBMin: 0,
    to: sender,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };
  if (isEncoded === "false") {
    return { to: LP_AGGREGATOR_ADDRESS, addParams };
  }
  const LP_Interface = new ethers.utils.Interface(LPAggreatorABI);
  const data = LP_Interface.encodeFunctionData("addLPFromToken", [
    tokenIn,
    amountIn,
    addParams,
  ]);
  return { to: LP_AGGREGATOR_ADDRESS, data };
}

function approve(
  spender = LP_AGGREGATOR_ADDRESS,
  amount = ethers.constants.MaxUint256
) {
  const tokenInterface = new ethers.utils.Interface(ERC20_ABI);
  const data = tokenInterface.encodeFunctionData("approve", [spender, amount]);
  return data;
}

async function estimateOutput(
  tokenA,
  tokenB,
  amountA,
  amountB,
  tokenX,
  tokenY
) {
  const provider = getProvider();
  const factory = new Contract(FACTORY_ADDRESS, factoryArtifact.abi, provider);
  const pairAddress = await factory.callStatic.getPair(tokenA, tokenB);
  const pairContract = new Contract(pairAddress, pairArtifact.abi, provider);
  const reserves = await pairContract.getReserves();
  const token0 =
    reserves[0].toString().slice(0, 3) === amountA.toString().slice(0, 3)
      ? tokenA
      : tokenB;
  const token1 =
    reserves[0].toString().slice(0, 3) === amountA.toString().slice(0, 3)
      ? tokenB
      : tokenA;
  const token0Contract = new Contract(token0, ERC20_ABI, provider);
  const token1Contract = new Contract(token1, ERC20_ABI, provider);
  const tokenXContract = new Contract(tokenX, ERC20_ABI, provider);
  const tokenYContract = new Contract(tokenY, ERC20_ABI, provider);
  const tokenXReserves = await tokenXContract.callStatic.balanceOf(pairAddress);
  const tokenYReserves = await tokenYContract.callStatic.balanceOf(pairAddress);
  const token0Reserves = await token0Contract.callStatic.balanceOf(pairAddress);
  const token1Reserves = await token1Contract.callStatic.balanceOf(pairAddress);
  const tokenXAmount = (
    (BigInt(tokenXReserves.toString()) * BigInt(amountA.toString())) /
    BigInt(token0Reserves.toString())
  ).toString();
  const tokenYAmount = (
    (BigInt(tokenYReserves.toString()) * BigInt(amountB.toString())) /
    BigInt(token1Reserves.toString())
  ).toString();
  return { tokenXAmount, tokenYAmount };
}

async function removeLPToToken(
  tokenA,
  tokenB,
  removePercent,
  sender,
  tokenOut,
  isEncoded
) {
  const removeParams = await removeLiquidity(
    tokenA,
    tokenB,
    removePercent,
    sender,
    LP_AGGREGATOR_ADDRESS,
    false
  );
  if (isEncoded === "false") {
    return { to: LP_AGGREGATOR_ADDRESS, removeParams, tokenOut };
  }
  const LP_Interface = new ethers.utils.Interface(LPAggreatorABI);
  const data = LP_Interface.encodeFunctionData("removeLPToToken", [
    removeParams,
    tokenOut,
    0,
  ]);
  return { to: LP_AGGREGATOR_ADDRESS, data: data };
}

module.exports = {
  buyTokenWithETH,
  sellTokenForETH,
  swapTokenForToken,
  addLiquidity,
  addLiquidityETH,
  removeLiquidity,
  removeLiquidityETH,
  swapTokenForLP,
  swapLPForLP,
  swapLPQuote,
  estimateOutput,
  getUserPool,
  getSwapParams,
  getAllowance,
  getTokenToLPParams,
  approve,
  removeLPToToken,
  FACTORY_ADDRESS,
  WETH_ADDRESS,
};
