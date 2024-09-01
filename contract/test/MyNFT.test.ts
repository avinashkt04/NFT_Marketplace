import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { assert, expect } from "chai";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("MyNFT", () => {
      let nft: any, deployer: SignerWithAddress, accounts: SignerWithAddress[];
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["MyNFT"]);
        nft = await ethers.getContractAt(
          "MyNFT",
          (
            await deployments.get("MyNFT")
          ).address
        );
      });

      describe("Constructor", () => {
        it("Initialize the NFT correctly!", async () => {
          const name = await nft.name();
          const symbol = await nft.symbol();
          assert.equal(name, "MyNFT");
          assert.equal(symbol, "MNFT");
          assert.equal(await nft.getTokenId(), 0);
        });
      });
      
      describe("CreateNFT", () => {
        it("Create NFT correctly!", async () => {
          const tokenUri = "ipfs://some-ipfs-hash";
          await expect(nft.createNFT(tokenUri))
            .to.emit(nft, "nftCreated")
            .withArgs(deployer.address, 1, tokenUri);
        });
      });
    });
