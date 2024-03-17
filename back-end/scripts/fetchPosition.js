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
  getWalletAddress,
  getProvider,
} = require("./helper");
const {
  Token,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
} = require("@uniswap/sdk-core");
const ERC20ABI = require("../abi/ERC20.json");

const INONFUNGIBLE_POSITION_MANAGER = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");

async function fetchPostions(walletAddress) {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const chainId = (await provider.getNetwork()).chainId;

  const nfpmContract = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
    INONFUNGIBLE_POSITION_MANAGER.abi,
    provider
  );
  const numPositions = await nfpmContract.callStatic.balanceOf(walletAddress);
  const calls = [];
  for (let i = 0; i < numPositions; i++) {
    calls.push(nfpmContract.callStatic.tokenOfOwnerByIndex(walletAddress, i));
  }
  const positionIds = await Promise.all(calls);
  const positionCalls = [];
  for (let id of positionIds) {
    positionCalls.push(nfpmContract.callStatic.positions(id));
  }
  const positions = await Promise.all(positionCalls);
  const positionInfos = positions.map((position, id) => {
    return {
      positionId: parseInt(positionIds[id].toString()),
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
      liquidity: position.liquidity.toString(),
      feeGrowthInside0LastX128: position.feeGrowthInside0LastX128.toString(),
      feeGrowthInside1LastX128: position.feeGrowthInside1LastX128.toString(),
      tokensOwed0: position.tokensOwed0.toString(),
      tokensOwed1: position.tokensOwed1.toString(),
    };
  });
  return positionInfos;
}
module.exports = {
  fetchPostions,
};

async function main() {
  console.log(await fetchPostions());
}
// main();
