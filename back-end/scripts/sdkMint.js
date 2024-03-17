const { ethers, constants } = require("ethers");
const {
  getProvider,
  FACTORY_ADDRESS,
  getWalletAddress,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  getTokenTransferApproval,
  makeToken,
  getBalance,
  toReadableAmount,
  USDC_ADDRESS,
  DAI_ADDRESS,
} = require("./helper");
const ERC20ABI = require("../abi/ERC20.json");

const {
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  Percent,
  Token,
} = require("@uniswap/sdk-core");
const {
  Position,
  Pool,
  nearestUsableTick,
  NonfungiblePositionManager,
  computePoolAddress,
  TickMath,
  Tick,
} = require("@uniswap/v3-sdk");
const IUniswapV3PoolABI = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const { getOutputQuote } = require("./quoter");

async function getCurrentPosition() {}

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

  const configuredPool = new Pool(
    tokenA,
    tokenB,
    fee,
    slot0.sqrtPriceX96.toString(),
    liquidity.toString(),
    slot0.tick
  );

  //   const tickLower =
  //     nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) -
  //     configuredPool.tickSpacing * 10;

  //   const tickUpper =
  //     nearestUsableTick(configuredPool.tickCurrent, configuredPool.tickSpacing) +
  //     configuredPool.tickSpacing * 10;

  const tickLower = -887220;
  const tickUpper = 887220;

  const position = Position.fromAmounts({
    pool: configuredPool,
    tickLower: tickLower,
    tickUpper: tickUpper,
    amount0: amount0,
    amount1: amount1,
    useFullPrecision: true,
  });

  const mintOptions = {
    recipient: getWalletAddress(),
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    slippageTolerance: new Percent(50, 10_000), // 0.5%
  };
  const { calldata, value } = NonfungiblePositionManager.addCallParameters(
    position,
    mintOptions
  );

  const transaction = {
    data: calldata,
    to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
    value: value,
    from: getWalletAddress(),
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    gasLimit: 1_000_000,
  };

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const txRes = await wallet.sendTransaction(transaction);
  await txRes.wait();
  console.log("Transaction hash: ", txRes.hash);
}

async function main() {
  const provider = getProvider();
  const walletAddress = getWalletAddress();
  const DAI_Contract = new ethers.Contract(DAI_ADDRESS, ERC20ABI, provider);
  const USDC_Contract = new ethers.Contract(USDC_ADDRESS, ERC20ABI, provider);
  console.log(
    "Before balance: ",
    ethers.utils.formatEther(await getBalance(DAI_Contract, walletAddress)),
    " / ",
    ethers.utils.formatUnits(await getBalance(USDC_Contract, walletAddress), 6)
  );
  console.log(
    "Quote: ",
    await getOutputQuote(
      DAI_ADDRESS,
      USDC_ADDRESS,
      500,
      ethers.utils.parseEther("1")
    )
  );
  await mintNewPosition(
    DAI_ADDRESS,
    USDC_ADDRESS, // USDC
    500,
    ethers.utils.parseEther("1000"),
    ethers.utils.parseUnits("1000", 6)
  );
  console.log(
    "After balance: ",
    ethers.utils.formatEther(await getBalance(DAI_Contract, walletAddress)),
    " / ",
    ethers.utils.formatUnits(await getBalance(USDC_Contract, walletAddress), 6)
  );
}
main();
