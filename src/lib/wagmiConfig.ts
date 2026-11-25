import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});

export const SEPOLIA_CHAIN_ID = sepolia.id;
export const SEPOLIA_EXPLORER_BASE = 'https://sepolia.etherscan.io';
