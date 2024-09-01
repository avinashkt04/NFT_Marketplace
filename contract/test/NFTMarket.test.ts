import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { assert, expect } from "chai";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("NFTMarket", () => {
      let nftMarket: any,
        deployer: any,
        accounts: SignerWithAddress[],
        player: SignerWithAddress,
        nft: any,
        dummyNft: any;
      const PRICE = ethers.parseEther("0.1");
      const TOKEN_ID = 1;
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        accounts = await ethers.getSigners();
        player = accounts[1];
        await deployments.fixture(["all"]);
        nftMarket = await ethers.getContractAt(
          "NFTMarket",
          (
            await deployments.get("NFTMarket")
          ).address
        );
        nft = await ethers.getContractAt(
          "MyNFT",
          (
            await deployments.get("MyNFT")
          ).address
        );
        await nft.createNFT("ipfs://some-ipfs-hash");
        await nft.approve(nftMarket.target, TOKEN_ID);
      });

      describe("ListNFT", () => {
        it("reverts when not owner!", async () => {
          const playerConnectednftMarket = nftMarket.connect(player);
          await expect(
            playerConnectednftMarket.listNft(nft.target, TOKEN_ID, PRICE)
          ).to.be.revertedWithCustomError(nftMarket, "NFTMarket__NotOwner");
        });
        it("reverts when price is 0", async () => {
          await expect(
            nftMarket.listNft(nft.target, TOKEN_ID, 0)
          ).to.be.revertedWithCustomError(nftMarket, "NFTMarket__InvalidPrice");
        });
        it("reverts when not approved", async () => {
          await nft.approve(nft.target, TOKEN_ID);
          await expect(
            nftMarket.listNft(nft.target, TOKEN_ID, PRICE)
          ).to.be.revertedWithCustomError(nftMarket, "NFTMarket__NotApproved");
        });
        it("update listing with seller and price", async () => {
          await nftMarket.listNft(nft.target, TOKEN_ID, PRICE);
          const listing = await nftMarket.getListing(nft.target, TOKEN_ID);
          assert.equal(listing.seller, deployer);
          assert.equal(listing.price, PRICE);
        });
        it("emit an event after listing an item", async () => {
          await expect(nftMarket.listNft(nft.target, TOKEN_ID, PRICE)).to.emit(
            nftMarket,
            "nftListed"
          );
        });
        it("reverts when item is already listed", async () => {
          await nftMarket.listNft(nft.target, TOKEN_ID, PRICE);
          await expect(
            nftMarket.listNft(nft.target, TOKEN_ID, PRICE)
          ).to.be.revertedWithCustomError(
            nftMarket,
            "NFTMarket__AlreadyListed"
          );
        });
      });

      describe("BuyNFT", () => {
        it("reverts when not listed", async () => {
          await expect(
            nftMarket.buyNft(nft.target, TOKEN_ID, { value: PRICE })
          ).to.be.revertedWithCustomError(nftMarket, "NFTMarket__NotListed");
        });
        it("reverts when not enough value", async () => {
          await nftMarket.listNft(nft.target, TOKEN_ID, PRICE);
          await expect(
            nftMarket.buyNft(nft.target, TOKEN_ID)
          ).to.be.revertedWithCustomError(nftMarket, "NFTMarket__PriceNotMet");
        });
        it("transfers the nft to the buyer and updates internal proceeds record", async () => {
          await nftMarket.listNft(nft.target, TOKEN_ID, PRICE);
          const playerConnectednftMarket = nftMarket.connect(player);
          await expect(
            playerConnectednftMarket.buyNft(nft.target, TOKEN_ID, {
              value: PRICE,
            })
          ).to.emit(nftMarket, "nftBought");
          const deployerProceeds = await nftMarket.getProceeds(deployer);
          assert.equal(deployerProceeds, PRICE);
          const newOwner = await nft.ownerOf(TOKEN_ID);
          assert.equal(newOwner, player.address);
        });
      });

      describe("cancelListing", () => {
        it("reverts when not owner", async () => {
          await nftMarket.listNft(nft.target, TOKEN_ID, PRICE);
          const playerConnectednftMarket = nftMarket.connect(player);
          await expect(
            playerConnectednftMarket.cancelListing(nft.target, TOKEN_ID)
          ).to.be.revertedWithCustomError(nftMarket, "NFTMarket__NotOwner");
        });
        it("reverts if item is not listed", async () => {
          await expect(
            nftMarket.cancelListing(nft.target, TOKEN_ID)
          ).to.be.revertedWithCustomError(nftMarket, "NFTMarket__NotListed");
        });
        it("emit an event and removes listing", async () => {
          await nftMarket.listNft(nft.target, TOKEN_ID, PRICE);
          await expect(nftMarket.cancelListing(nft.target, TOKEN_ID))
            .to.emit(nftMarket, "nftCancelled")
            .withArgs(deployer, nft.target, TOKEN_ID);
          const listing = await nftMarket.getListing(nft.target, TOKEN_ID);
          assert.equal(listing.price.toString(), "0");
        });
      });

      describe("updateListing", () => {
        it("reverts when not owner", async () => {
            await nftMarket.listNft(nft.target, TOKEN_ID, PRICE)
            const playerConnectednftMarket = nftMarket.connect(player)
            await expect(
                playerConnectednftMarket.updateListing(nft.target, TOKEN_ID, PRICE)
            ).to.be.revertedWithCustomError(nftMarket, "NFTMarket__NotOwner")
        })
        it("reverts if item is not listed", async () => {
            await expect(nftMarket.updateListing(nft.target, TOKEN_ID,PRICE))
                .to.be.revertedWithCustomError(nftMarket, "NFTMarket__NotListed")
        })
        it("revert if newPrice is less than or equal to zero", async () => {
            await nftMarket.listNft(nft.target, TOKEN_ID, PRICE)
            await expect(nftMarket.updateListing(nft.target, TOKEN_ID, 0)).to.be.revertedWithCustomError(nftMarket, "NFTMarket__InvalidPrice")
        })
        it("update the price and emit an event", async () => {
            await nftMarket.listNft(nft.target, TOKEN_ID, PRICE)
            const newPrice = await ethers.parseEther("0.2")
            await expect(nftMarket.updateListing(nft.target, TOKEN_ID, newPrice)).to.emit(nftMarket, "nftListed")
            const listing = await nftMarket.getListing(nft.target, TOKEN_ID)
            assert.equal(newPrice.toString(), listing.price.toString() )
        })
      })

      describe("withdrawProceeds", () => {
          it("reverts if proceed is 0", async () => {
              await expect(nftMarket.withdrawProceeds()).to.be.revertedWithCustomError(
                  nftMarket,
                  "NFTMarket__NoProceeds"
              )
          })
          it("withdraws proceeds", async function () {
            await nftMarket.listNft(nft.target, TOKEN_ID, PRICE)
            const deployerBalanceBefore = await ethers.provider.getBalance(deployer)
            const deployerProceedBefore = await nftMarket.getProceeds(deployer)
            const playerConnectednftMarket = nftMarket.connect(player)
            await playerConnectednftMarket.buyNft(nft.target, TOKEN_ID, { value: PRICE })
            const deployerProceedAfter = await nftMarket.getProceeds(deployer)
            const txResponse = await nftMarket.withdrawProceeds()
            const txReceipt = await txResponse.wait(1)
            const {gasUsed, gasPrice} = txReceipt
            const gasCost = gasUsed * gasPrice
            const deployerBalanceAfter = await ethers.provider.getBalance(deployer)
            // @ts-ignore
            assert.equal((deployerBalanceBefore + deployerProceedAfter).toString(), (deployerBalanceAfter + gasCost).toString())
        })
      })
    });
