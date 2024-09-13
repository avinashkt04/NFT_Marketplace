# NFTSpace - Decentralized NFT Marketplace

Welcome to NFTSpace, a decentralized marketplace for creating, selling, buying, updating, and canceling NFTs. Our platform is fully responsive, robust, and user-friendly, providing a seamless experience for users to engage with NFTs.

## Features

- **Create NFT**: Mint your unique NFTs directly on the platform.
- **Sell NFT**: List your NFTs for sale on the marketplace.
- **Buy NFT**: Purchase NFTs from other users.
- **Update NFT**: Modify details of your listed NFTs.
- **Cancel NFT**: Withdraw your NFT from sale.
- **Withdraw Funds**: Easily withdraw your earnings from sales.

## Prerequisites

Before you get started, make sure you have the following:
- **MetaMask Wallet**: Installed in your browser.
- **Node.js**: Version 18 or higher.

## Cloning

To clone this repository to your local machine, go to the location and run the following command in terminal:

```bash
git clone https://github.com/avinashkt04/MediBot.git
```

## Getting Started

### Contract Deployment

1. **Install Dependencies:**
    
    ```bash
    cd contract
    yarn install
    ```

2. **Deploy Contract:**

    ```bash
    hh deploy --network sepolia
    ```
3. Create a `.env` file in the `contract` directory with the following content:
    ```dotenv
    SEPOLIA_RPC_URL=<sepolia_rpc_url>
    PRIVATE_KEY=<your_wallet_private_key>
    ETHERSCAN_API_KEY=<your_etherscan_api_key>
    UPDATE_FRONTEND=true
    ```
    Replace  <sepolia_rpc_url>, <your_wallet_private_key>, and <your_etherscan_api_key> with your actual values.

### Nextjs Setup

1. **Install Dependencies:**
    
    ```bash
    cd nextjs
    yarn install
    ```

2. **Run the Development Server:**

    ```bash
    yarn dev
    ```
3. Create a `.env` file in the `nextjs` directory with the following content:
    ```dotenv
    PINATA_API_KEY=<your_pinata_api_key>
    PINATA_SECRET_API_KEY=<your_pinata_secret_api_key>
    MONGODB_URI=<your_mongodb_uri>
    ```
    Replace <your_pinata_api_key>, <your_pinata_secret_api_key> and <your_mongodb_uri> with your actual values.

## Video Demo

[Watch the demo video](https://drive.google.com/file/d/1gGnL37_Mu5DJDlRP9bCFxrTGQWptuLrB/view?usp=sharing)
