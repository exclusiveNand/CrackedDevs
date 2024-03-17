const { ethers } = require("ethers");
const { getProvider, WETH_ADDRESS } = require("./helper");
const ERC20_ABI = require("../abi/ERC20.json");

async function main() {
  const provider = getProvider();
  const WETH_Contract = new ethers.Contract(WETH_ADDRESS, ERC20_ABI, provider);
  console.log(
    "Before balance: ",
    (await WETH_Contract.balanceOf(process.env.WALLET_ADDRESS)).toString()
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  await wallet.sendTransaction({
    to: WETH_ADDRESS,
    value: ethers.utils.parseEther("1000"),
  });
  console.log(
    "After balance: ",
    ethers.utils
      .formatEther(await WETH_Contract.balanceOf(process.env.WALLET_ADDRESS))
      .toString()
  );
}
main();
