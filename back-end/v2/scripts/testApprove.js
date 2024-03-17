const { ethers } = require("ethers");
const dotenv = require("dotenv");
const { abi: LPAggreatorABI } = require("../ABI/LPAggreator.json");
const {
  getSwapParams,
  getTokenToLPParams,
  removeLPToToken,
  approve,
} = require("../index");
const { getProvider } = require("../../scripts/helper");
dotenv.config();

async function main() {
  const tokenAddress = "0x21ea4b3239912470b9200357dda507f7c24053e2";
  const data = approve();

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, getProvider());

  const transaction = {
    data: data,
    to: tokenAddress,
    value: 0,
    from: wallet.address,
    gasPrice: 30_000_000_000,
    gasLimit: 2_000_000,
  };
  console.log(transaction);

  const tx = await wallet.sendTransaction(transaction);
  const reciept = await tx.wait();
}
main();
