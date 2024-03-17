const { ethers, Wallet } = require("ethers");
const {
  getProvider,
  getWalletAddress,
  getTokenTransferApproval,
  makeToken,
  getBalance,
  USDC_ADDRESS,
  DAI_ADDRESS,
} = require("./helper");
const ERC20ABI = require("../abi/ERC20.json");

const { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } = require("@uniswap/sdk-core");
const { fetchPostions } = require("./fetchPosition");

async function addLiquidity(tokenId, amount0, amount1) {
  // const provider = getProvider();
  // const chainId = (await provider.getNetwork()).chainId;
  // const tokenA = await makeToken(token0);
  // const tokenB = await makeToken(token1);

  // await getTokenTransferApproval(
  //   tokenA,
  //   amount0,
  //   NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
  // );

  // await getTokenTransferApproval(
  //   tokenB,
  //   amount1,
  //   NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
  // );

  const params = {
    tokenId,
    amount0Desired: amount0,
    amount1Desired: amount1,
    amount0Min: 0,
    amount1Min: 0,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
  };
  return params;
  // const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
  // const tx = await nftPositionManager.connect(wallet).increaseLiquidity(params);
  // await tx.wait();
  // console.log("Liquidity added");
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
  const positionsInfo = await fetchPostions();

  await addLiquidity(
    positionsInfo[positionsInfo.length - 1].positionId,
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

module.exports = {
  addLiquidity,
};
