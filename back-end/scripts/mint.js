const { ethers } = require("ethers");
const {
  getProvider,
  FACTORY_ADDRESS,
  getWalletAddress,
  WETH_ADDRESS,
  getTokenTransferApproval,
  makeToken,
  getBalance,
  toReadableAmount,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  USDC_ADDRESS,
  DAI_ADDRESS,
} = require("./helper");
const ERC20ABI = require("../abi/ERC20.json");

const {
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  Percent,
} = require("@uniswap/sdk-core");
const {
  Position,
  Pool,
  nearestUsableTick,
  computePoolAddress,
  NonfungiblePositionManager,
  TickMath,
} = require("@uniswap/v3-sdk");
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const { getOutputQuote } = require("./quoter");
const {
  abi: NonfungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
const { constructPool } = require("./LP_Helper");
const { fetchPostions } = require("./fetchPosition");

async function mintNewPosition(token0, token1, fee, amount0, amount1) {
  const provider = getProvider();
  const chainId = (await provider.getNetwork()).chainId;
  const tokenA = await makeToken(token0);
  const tokenB = await makeToken(token1);
  console.log("Minting position for: ", tokenA.symbol, tokenB.symbol, fee);
  console.log(
    "Amounts: ",
    toReadableAmount(amount0.toString(), tokenA.decimals),
    toReadableAmount(amount1.toString(), tokenB.decimals)
  );

  await getTokenTransferApproval(
    tokenA,
    amount0,
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
  );

  await getTokenTransferApproval(
    tokenB,
    amount1,
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
  );

  const configuredPool = await constructPool(
    tokenA,
    tokenB,
    fee,
    amount0,
    amount1,
    provider
  );

  const params = {
    token0,
    token1,
    fee,
    tickLower: configuredPool.tickLower,
    tickUpper: configuredPool.tickUpper,
    amount0Desired: amount0.toString(),
    amount1Desired: amount1.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: getWalletAddress(),
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
  };

  console.log("Minting position with params: ", params);
  return params;

  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // const nftManager = new ethers.Contract(
  //   NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
  //   NonfungiblePositionManagerABI,
  //   wallet
  // );
  // const tx = await nftManager.mint(params, {
  //   gasLimit: 3_000_000,
  // });

  // await tx.wait();
  // console.log("Transaction hash: ", tx.hash);
}

async function main() {
  const provider = getProvider();
  const walletAddress = getWalletAddress();
  const DAI_Contract = new ethers.Contract(DAI_ADDRESS, ERC20ABI, provider);
  const USDC_Contract = new ethers.Contract(USDC_ADDRESS, ERC20ABI, provider);
  console.log(
    "Before balance: ",
    ethers.utils.formatUnits(await getBalance(DAI_Contract, walletAddress), 18),
    " / ",
    ethers.utils.formatUnits(await getBalance(USDC_Contract, walletAddress), 6)
  );

  await mintNewPosition(
    DAI_ADDRESS,
    USDC_ADDRESS,
    500,
    ethers.utils.parseUnits("100", 18),
    ethers.utils.parseUnits("100", 6)
  );

  console.log(
    "After balance: ",
    ethers.utils.formatUnits(await getBalance(DAI_Contract, walletAddress), 18),
    " / ",
    ethers.utils.formatUnits(await getBalance(USDC_Contract, walletAddress), 6)
  );
}
// main();
