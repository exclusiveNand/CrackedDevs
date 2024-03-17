const { ethers } = require("ethers");
const dotenv = require("dotenv");
const { abi: LPAggreatorABI } = require("../ABI/LPAggreator.json");
const {
  getSwapParams,
  getTokenToLPParams,
  removeLPToToken,
} = require("../index");
const { getProvider } = require("../../scripts/helper");
dotenv.config();

async function main() {
  const data = await removeLPToToken(
    "0x7d682e65efc5c13bf4e394b8f376c48e6bae0355",
    "0x2ed3dddae5b2f321af0806181fbfa6d049be47d8",
    1000,
    "0x9f05e3f61a93af744112fBAa880b1aF8e1935fb8",
    "0x49916ba65d0048c4bbb0a786a527d98d10a1cd2d"
    // false
  );

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, getProvider());

  // const LPAggreator = new ethers.Contract(
  //   LP_AGGREGATOR_ADDRESS,
  //   LPAggreatorABI,
  //   getProvider()
  // );
  // const tx = await LPAggreator.connect(wallet).swapLP(
  //   data.removeParams,
  //   data.addParams,
  //   {
  //     gasLimit: 2_000_000,
  //     gasPrice: 30_000_000_000,
  //   }
  // );
  // const reciept = await tx.wait();
  // console.log(reciept);

  const transaction = {
    data: data.data,
    to: data.to,
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
