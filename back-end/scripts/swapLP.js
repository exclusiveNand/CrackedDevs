const { ethers } = require("ethers");
const { removeLiquidity } = require("./removeLiquidity");
const { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } = require("@uniswap/sdk-core");
const { getProvider } = require("./helper");
const {
  abi: NonfungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
const { swap } = require("./swap");

const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

async function swapLP(tokenRemoveId, removePercent, tokenAddId, recipient) {
  const provider = getProvider();
  const chainId = (await provider.getNetwork()).chainId;
  const [removeParams, collectParams] = await removeLiquidity(
    tokenRemoveId,
    removePercent,
    recipient
  );
  const nftPositionManager = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
    NonfungiblePositionManagerABI,
    provider
  );

  const removePool = await nftPositionManager.callStatic.positions(
    tokenRemoveId
  );

  const [tokenRemove0, tokenRemove1] = [
    removePool.token0.toString(),
    removePool.token1.toString(),
  ];

  const addPool = await nftPositionManager.callStatic.positions(tokenAddId);
  const [tokenAdd0, tokenAdd1] = [
    addPool.token0.toString(),
    addPool.token1.toString(),  
  ];

  const expectedReturn = await nftPositionManager.callStatic.decreaseLiquidity(
    removeParams
  );

  const [amount0, amount1] = [
    expectedReturn[0].toString(),
    expectedReturn[1].toString(),
  ];

  const swapPair0Params = await swap(
    tokenRemove0,
    tokenAdd0,
    
  );
}

async function main() {}
// main();

module.exports = { swapLP };
