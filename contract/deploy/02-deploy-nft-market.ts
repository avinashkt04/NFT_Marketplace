import { network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

module.exports = async ({
  getNamedAccounts,
  deployments,
}: {
  getNamedAccounts: any;
  deployments: any;
}) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("------------------------------------");
  const args: [] = [];

  const nftMarket = await deploy("NFTMarket", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmation: developmentChains.includes(network.name) ? 1 : 5,
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(nftMarket.address, args);
  }
  log("------------------------------------");
};

module.exports.tags = ["all", "NFTMarket"];
