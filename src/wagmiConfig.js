import { http, createConfig } from "wagmi";
import {
  mainnet,
  confluxESpace,
  confluxESpaceTestnet,
  goerli,
  sepolia,
  songbirdTestnet,
} from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const WagmiConfig = createConfig({
  chains: [mainnet, sepolia, goerli, confluxESpace, confluxESpaceTestnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [goerli.id]: http(),
    [confluxESpace.id]: http(),
    [confluxESpaceTestnet.id]: http(),
  },
});
