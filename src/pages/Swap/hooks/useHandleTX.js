import { useAccount, useSendTransaction, useWriteContract } from "wagmi";
import axios from "axios";
import { maxUint256, parseGwei, parseUnits } from "viem";
import ERC20ABI from "../../../abi/ERC20ABI.json";
import { abi as LPAggregatorABI } from "../../../abi/LPAggregator.json";
import { ethers } from "ethers";
import { useContext } from "react";
import { SignerContext } from "../../../Contexts/SignerContext";

const useHandleTx = () => {
  const { sendTransactionAsync, onSuccess } = useSendTransaction();
  const { address } = useAccount();
  const LP_AGGREGATOR_ADDRESS = import.meta.env.VITE_LP_AGGREGATOR_ADDRESS;
  const { writeContractAsync } = useWriteContract();
  const { signer } = useContext(SignerContext);

  const handleApproveRemove = async (
    tokenA,
    tokenB,
    removePercent,
    tokenOut,
    pairAddress
  ) => {
    if (!address) {
      console.error("No address found");
      return;
    }
    if (!tokenA || !tokenB || !tokenOut) {
      console.error("Token addresses not found");
      return;
    }
    if (!removePercent) {
      console.error("Remove percent not set");
      return;
    }
    try {
      const allowanceRespond = await axios.get(
        import.meta.env.VITE_API_ENDPOINT + "/getAllowance",
        {
          params: {
            token: pairAddress,
            owner: address,
          },
        }
      );
      const isAllowed = allowanceRespond.data.allowance !== "0";

      console.log("isAllowed:", isAllowed);

      if (!isAllowed) {
        const pairContract = new ethers.Contract(pairAddress, ERC20ABI, signer);
        const tx = await pairContract.approve(
          LP_AGGREGATOR_ADDRESS,
          maxUint256
        );
        console.log("tx:", await tx.wait());
      }

      const txParams = await axios.get(
        import.meta.env.VITE_API_ENDPOINT + "/removeLPToToken",
        {
          params: {
            tokenA,
            tokenB,
            removePercent: removePercent * 100,
            sender: address,
            tokenOut,
            isEncoded: false,
          },
        }
      );
      console.log("txParams:", txParams.data);

      const removeLiquidContract = new ethers.Contract(
        LP_AGGREGATOR_ADDRESS,
        LPAggregatorABI,
        signer
      );

      const removeTx = await removeLiquidContract.removeLPToToken(
        txParams.data.params.removeParams,
        txParams.data.params.tokenOut,
        parseUnits("0", 18),
        { gasPrice: parseGwei("30"), gasLimit: 2_000_000 }
      );
      console.log("removeTx:", await removeTx.wait());
      alert("Transaction successful");
    } catch (error) {
      console.error("Error while approving:", error);
    }
  };

  const handleApproveE = async (tokenE, tokenE_Amount, tokenX, tokenY) => {
    if (!address) {
      console.error("No address found");
      return;
    }
    if (!tokenE || !tokenE_Amount || !tokenX || !tokenY) {
      console.error("Token addresses not found");
      return;
    }
    try {
      const allowanceRespond = await axios.get(
        import.meta.env.VITE_API_ENDPOINT + "/getAllowance",
        {
          params: {
            token: tokenE,
            owner: address,
          },
        }
      );
      const isAllowed = allowanceRespond.data.allowance !== "0";

      console.log("isAllowed:", isAllowed);

      if (!isAllowed) {
        const tokenContract = new ethers.Contract(tokenE, ERC20ABI, signer);
        const tx = await tokenContract.approve(
          LP_AGGREGATOR_ADDRESS,
          maxUint256
        );
        console.log("tx:", await tx.wait());
      }
      const txParams = await axios.get(
        import.meta.env.VITE_API_ENDPOINT + "/getTokenToLPParams",
        {
          params: {
            tokenIn: tokenE,
            amountIn: parseUnits(tokenE_Amount, 18),
            tokenA: tokenX,
            tokenB: tokenY,
            sender: address,
            isEncoded: false,
          },
        }
      );
      console.log("txParams:", txParams.data);
      const addLiquidContract = new ethers.Contract(
        LP_AGGREGATOR_ADDRESS,
        LPAggregatorABI,
        signer
      );
      console.log("txParams:", txParams.data.params.addParams);
      console.log(tokenE, parseUnits(tokenE_Amount, 18));
      const addTx = await addLiquidContract.addLPFromToken(
        tokenE,
        parseUnits(tokenE_Amount, 18),
        txParams.data.params.addParams,
        { gasPrice: parseGwei("30"), gasLimit: 2_000_000 }
      );
      console.log("addTx:", await addTx.wait());
      alert("Transaction successful");
    } catch (error) {
      console.error("Error while approving:", error);
    }
  };

  const handleApprove = async (
    tokenA,
    tokenB,
    removePercent,
    tokenX,
    tokenY,
    pairAddress
  ) => {
    if (!address) {
      console.error("No address found");
      return;
    }
    if (!tokenA || !tokenB || !tokenX || !tokenY) {
      console.error("Token addresses not found");
      return;
    }
    if (!removePercent) {
      console.error("Remove percent not set");
      return;
    }
    try {
      console.log("Approving tokens");
      const allowanceRespond = await axios.get(
        import.meta.env.VITE_API_ENDPOINT + "/getAllowance",
        {
          params: {
            token: pairAddress,
            owner: address,
          },
        }
      );
      const isAllowed = allowanceRespond.data.allowance !== "0";

      if (!isAllowed) {
        const pairContract = new ethers.Contract(pairAddress, ERC20ABI, signer);
        const tx = await pairContract.approve(
          LP_AGGREGATOR_ADDRESS,
          maxUint256
        );
        console.log("tx:", await tx.wait());
      }
      const txParams = await axios.get(
        import.meta.env.VITE_API_ENDPOINT + "/getSwapParams",
        {
          params: {
            tokenA,
            tokenB,
            removePercent: removePercent * 100,
            tokenX,
            tokenY,
            sender: address,
            isEncoded: false,
          },
        }
      );
      console.log("txParams:", txParams.data);
      const swapContract = new ethers.Contract(
        LP_AGGREGATOR_ADDRESS,
        LPAggregatorABI,
        signer
      );
      const swapTx = await swapContract.swapLP(
        txParams.data.params.removeParams,
        txParams.data.params.addParams
      );
      console.log("swapTx:", await swapTx.wait());
      alert("Transaction successful");
    } catch (error) {
      console.error("Error while approving:", error);
    }
  };
  return { handleApprove, handleApproveE, handleApproveRemove };
};

export default useHandleTx;
