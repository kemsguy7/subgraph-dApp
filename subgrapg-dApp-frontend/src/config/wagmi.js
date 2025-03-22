import { sepolia } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

// Create the Wagmi config focused on Sepolia testnet
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Staking dApp',
    }),
    // walletConnect({
    //   projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
    // }),
  ],
  //   transports: {
  //     [sepolia.id]: http('https://sepolia.infura.io/v3/YOUR_INFURA_KEY'), // Replace with your Infura key
  //   },
  transports: {
    [sepolia.id]: http('https://sepolia.infura.io/v3/YOUR_INFURA_KEY'), // Replace with your Infura key
  },
});

// Constants for the staking contract
export const STAKING_CONTRACT_ADDRESS = '0xYourDeployedContractAddress'; // Replace with actual deployed address on Sepolia
