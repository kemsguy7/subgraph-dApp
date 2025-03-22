# Staking dApp with The Graph Integration

A decentralized staking application built with React, Wagmi, Ethers.js, and The Graph Protocol. This dApp allows users to stake ERC20 tokens, earn rewards, and track their staking activity on the Sepolia testnet.

## Features

- Connect your Ethereum wallet (MetaMask, Coinbase Wallet, etc.)
- Stake ERC20 tokens and earn rewards
- View pending rewards and claim them when ready
- Withdraw tokens after the lock period
- Emergency withdrawal option with penalty
- Track staking history and protocol metrics
- Real-time data updates via subgraph queries

## Project Structure

The project consists of two main parts:

1. **Subgraph**: Indexes events from the staking contract to provide efficient data querying
2. **Frontend**: React application that interacts with the staking contract and displays data from the subgraph

### Directory Structure

```
staking-dapp/
├── frontend/             # React application
│   ├── public/           # Static files
│   └── src/              # Source code
│       ├── abis/         # Contract ABIs
│       ├── components/   # React components
│       ├── context/      # React context providers
│       ├── hooks/        # Custom hooks
│       └── utils/        # Utility functions
├── subgraph/             # The Graph subgraph
│   ├── abis/             # Contract ABIs for the subgraph
│   ├── src/              # Subgraph mappings
│   ├── schema.graphql    # GraphQL schema
│   └── subgraph.yaml     # Subgraph manifest
└── README.md             # Project documentation
```

## Prerequisites

- Node.js (v14+)
- Yarn or npm
- MetaMask or any Ethereum wallet
- Some Sepolia ETH for gas

## Staking Contract

The staking contract is deployed on Sepolia testnet at `0xYourDeployedContractAddress` (replace with actual address).

### Key Contract Features

- Stake ERC20 tokens with a minimum lock duration
- Dynamic APR that decreases as total staked amount increases
- Emergency withdrawal option with a penalty
- Rewards calculated per minute based on the current APR

## Subgraph

The subgraph indexes the following events from the staking contract:

- `Staked`: Tracks when users stake tokens
- `Withdrawn`: Tracks when users withdraw tokens
- `EmergencyWithdrawn`: Tracks emergency withdrawals with penalties
- `RewardsClaimed`: Tracks when users claim rewards
- `RewardRateUpdated`: Tracks changes in the APR
- `StakingInitialized`, `StakingPaused`, `StakingUnpaused`: Tracks protocol state changes

### Subgraph Deployment

The subgraph is deployed at: `https://api.thegraph.com/subgraphs/name/yourusername/staking-subgraph` (replace with actual deployment URL)

### Deploying Your Own Subgraph

1. Install The Graph CLI:

   ```bash
   npm install -g @graphprotocol/graph-cli
   ```

2. Initialize the subgraph (replace placeholders):

   ```bash
   cd subgraph
   graph init --studio staking-subgraph
   ```

3. Update `subgraph.yaml`, `schema.graphql`, and mapping files with the ones in this repo.

4. Authenticate and deploy:
   ```bash
   graph auth --studio YOUR_DEPLOY_KEY
   graph codegen && graph build
   graph deploy --studio staking-subgraph
   ```

## Frontend Application

The frontend is built with React and uses the Wagmi library for Ethereum interactions and Apollo Client for GraphQL queries.

### Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/staking-dapp.git
   cd staking-dapp
   ```

2. Install dependencies:

   ```bash
   cd frontend
   yarn install  # or npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file:

   ```
   REACT_APP_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/yourusername/staking-subgraph
   REACT_APP_STAKING_CONTRACT_ADDRESS=0xYourDeployedContractAddress

   ```

4. Start the development server:

   ```bash
   yarn start  # or npm start
   ```

5. Build for production:
   ```bash
   yarn build  # or npm run build
   ```

## Customization

- To use a different ERC20 token, update the contract address in the constants file
- To change the network, update the Wagmi configuration to target your desired network

## Troubleshooting

- **Cannot connect wallet**: Ensure you have an Ethereum wallet extension installed
- **Network error**: Make sure you're connected to the Sepolia testnet
- **Subgraph data not loading**: Check that the subgraph URL is correct and the subgraph is deployed and synced
