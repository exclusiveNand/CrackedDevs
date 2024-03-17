const { ethers, Wallet } = require("ethers");
const {
  getProvider,
  getWalletAddress,
  getTokenTransferApproval,
  makeToken,
  getBalance,
  toReadableAmount,
  USDC_ADDRESS,
  DAI_ADDRESS,
} = require("./helper");
const ERC20ABI = require("../abi/ERC20.json");

const { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } = require("@uniswap/sdk-core");
const {
  abi: NonfungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json");
const { fetchPostions } = require("./fetchPosition");
const { DENOMINATOR, MAX_UINT128 } = require("./LP_Helper");

async function removeLiquidity(tokenId, removePercent, recipient) {
  const provider = getProvider();
  const chainId = (await provider.getNetwork()).chainId;

  const nftPositionManager = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
    NonfungiblePositionManagerABI,
    provider
  );

  const positionInfo = await nftPositionManager.callStatic.positions(tokenId);
  const liquidity = positionInfo.liquidity;

  const removeParams = {
    tokenId,
    liquidity: (
      (BigInt(liquidity) / BigInt(DENOMINATOR)) *
      BigInt(removePercent)
    ).toString(),
    amount0Min: 0,
    amount1Min: 0,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
  };

  const collectParams = {
    tokenId,
    recipient: recipient,
    amount0Max: MAX_UINT128,
    amount1Max: MAX_UINT128,
  };

  const encodedRemoveParams = nftPositionManager.interface.encodeFunctionData(
    "decreaseLiquidity",
    [removeParams]
  );
  const encodedCollectParams = nftPositionManager.interface.encodeFunctionData(
    "collect",
    [collectParams]
  );
  // return [encodedRemoveParams, encodedCollectParams];

  return [
    removeParams,
    collectParams,
    encodedRemoveParams,
    encodedCollectParams,
  ];

  // const tx = await nftPositionManager
  //   .connect(wallet)
  //   .multicall([encodedRemoveParams, encodedCollectParams], {
  //     gasLimit: 1_000_000,
  //   });
  // await tx.wait();
  // console.log("Liquidity removed");
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

  await removeLiquidity(
    positionsInfo[positionsInfo.length - 1].positionId,
    DAI_ADDRESS,
    USDC_ADDRESS,
    500,
    DENOMINATOR / 10
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
  removeLiquidity,
};
