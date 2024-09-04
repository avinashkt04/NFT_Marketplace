import { deployments, ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

const FRONTEND_NFT_ABI_FILE = path.join(__dirname, "../../nextjs/constants/nftAbi.json");
const FRONTEND_NFT_MARKET_ABI_FILE = path.join(__dirname, "../../nextjs/constants/nftMarketAbi.json");
const FRONTEND_NFT_ADDRESS_FILE = path.join(__dirname, "../../nextjs/constants/nftAddress.json");
const FRONTEND_NFT_MARKET_ADDRESS_FILE = path.join(__dirname, "../../nextjs/constants/nftMarketAddress.json");

module.exports = async () => {
    if (process.env.UPDATE_FRONTEND === "true") {
        console.log("Updating frontend...");
        await updateContractAddress();
        await updateContractABI();
    }
}

const updateContractAddress = async () => {
    const myNft = await ethers.getContractAt(
        "MyNFT",
        (await deployments.get("MyNFT")).address
    );

    const nftMarket = await ethers.getContractAt(
        "NFTMarket",
        (await deployments.get("NFTMarket")).address
    );

    const chainId = network.config.chainId?.toString();
    const currentAbiAddress = JSON.parse(fs.readFileSync(FRONTEND_NFT_ADDRESS_FILE, "utf-8"));
    const currentMarketAbiAddress = JSON.parse(fs.readFileSync(FRONTEND_NFT_MARKET_ADDRESS_FILE, "utf-8"));
    if(chainId! in currentAbiAddress) {
        if(!currentAbiAddress[chainId!].includes(myNft.target)) {
            currentAbiAddress[chainId!].push(myNft.target);
        }
    } else {
        currentAbiAddress[chainId!] = [myNft.target];
    }

    if(chainId! in currentMarketAbiAddress) {
        if(!currentMarketAbiAddress[chainId!].includes(nftMarket.target)) {
            currentMarketAbiAddress[chainId!].push(nftMarket.target);
        }
    } else {
        currentMarketAbiAddress[chainId!] = [nftMarket.target];
    }

    fs.writeFileSync(FRONTEND_NFT_ADDRESS_FILE, JSON.stringify(currentAbiAddress));
    fs.writeFileSync(FRONTEND_NFT_MARKET_ADDRESS_FILE, JSON.stringify(currentMarketAbiAddress));
}

const updateContractABI = async () => {
    const myNft = await ethers.getContractAt(
        "MyNFT",
        (await deployments.get("MyNFT")).address
    );

    const nftMarket = await ethers.getContractAt(
        "NFTMarket",
        (await deployments.get("NFTMarket")).address
    );

    fs.writeFileSync(FRONTEND_NFT_ABI_FILE, myNft.interface.formatJson());
    fs.writeFileSync(FRONTEND_NFT_MARKET_ABI_FILE, nftMarket.interface.formatJson());
}

module.exports.tags = ["Frontend"];
