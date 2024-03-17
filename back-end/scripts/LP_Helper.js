const {
  computePoolAddress,
  Pool,
  nearestUsableTick,
  Position,
} = require("@uniswap/v3-sdk");
const { getProvider, FACTORY_ADDRESS } = require("./helper");
const { ethers } = require("ethers");
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const DENOMINATOR = 10_000;

const MAX_UINT128 = "340282366920938463463374607431768211455";

async function constructPool(tokenA, tokenB, fee, amount0, amount1, provider) {
  if (!provider) {
    provider = getProvider();
  }
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
  const [liquidity, slot0] = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);
  const pool = new Pool(
    tokenA,
    tokenB,
    fee,
    slot0.sqrtPriceX96.toString(),
    liquidity.toString(),
    slot0.tick
  );

  const tickSpacing = pool.tickSpacing;
  const tickLower = nearestUsableTick(slot0.tick, tickSpacing) - tickSpacing;
  const tickUpper = nearestUsableTick(slot0.tick, tickSpacing) + tickSpacing;

  return Position.fromAmounts({
    pool,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    useFullPrecision: true,
  });
}

module.exports = {
  constructPool,
  MAX_UINT128,
  DENOMINATOR,
};
