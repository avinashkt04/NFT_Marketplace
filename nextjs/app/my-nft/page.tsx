"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import NftCard from "@/components/NftCard";
import { useMetaMask } from "@/context/MetamaskContext";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { ethers } from "ethers";
import nftMarketAddress from "@/constants/nftMarketAddress.json";
import nftMarketAbi from "@/constants/nftMarketAbi.json";
import nftAddress from "@/constants/nftAddress.json";
import nftAbi from "@/constants/nftAbi.json";
import { toast } from "react-toastify";
import { SkeletonComponent } from "@/components/Skeleton";

type Nft = {
  tokenUri: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  chainId: string;
  status: string;
  tokenId: string;
  price?: string;
};

export default function MyNftPage() {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("unlisted");
  const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
  const [price, setPrice] = useState<string>("");
  const [proceeds, setProceeds] = useState<string>("");

  const { address, chainId, signer } = useMetaMask();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/database-fetch");
      console.log(response.data);
      let nftData: Nft[] = [];

      for (let nft of response.data?.data) {
        const ipfsHash = nft.tokenUri.replace("ipfs://", "");
        const tokenUriURL = `https://black-blank-snipe-168.mypinata.cloud/ipfs/${ipfsHash}`;

        try {
          const tokenUriResponse = await axios.get(tokenUriURL);
          console.log(
            `Token URI Response: ${JSON.stringify(tokenUriResponse.data)}`
          );

          nftData.push({
            tokenUri: nft.tokenUri,
            name: tokenUriResponse?.data.name,
            description: tokenUriResponse?.data.description,
            image: tokenUriResponse?.data.image,
            tokenId: nft.tokenId,
            owner: nft.owner,
            chainId: nft.chainId,
            status: nft.status,
            price: nft?.price,
          });
        } catch (error) {
          console.error("Error fetching token URI:", error);
        }
      }
      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFT data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (nft: Nft) => {
    console.log(`price: ${nft.price}`);
    setSelectedNft(nft);
    setPrice(nft.price || "");
    onOpen();
  };

  const handleSellNft = async () => {
    if (selectedNft && price) {
      console.log(selectedNft);
      try {
        setIsLoading(true);
        const nftMarket =
          nftMarketAddress[
            chainId?.toString() as keyof typeof nftMarketAddress
          ][0];
        const contract = new ethers.Contract(nftMarket, nftMarketAbi, signer);

        contract.once(
          "nftListed",
          async (owner, nftAddress, tokenId, price) => {
            console.log("owner", owner);
            console.log("nftAddress", nftAddress);
            console.log("tokenId", tokenId.toString());
            console.log("price", ethers.formatEther(price.toString()));
            const data = {
              tokenUri: selectedNft.tokenUri,
              tokenId: tokenId.toString(),
              owner,
              chainId: chainId?.toString(),
              status: "listed",
              price: ethers.formatEther(price).toString(),
            };
            await axios.post("/api/database-update", JSON.stringify(data));
            toast.success("NFT listed successfully");
            await fetchData();
            onClose();
          }
        );

        const nftAdd =
          nftAddress[chainId?.toString() as keyof typeof nftAddress][0];
        const nftContract = new ethers.Contract(nftAdd, nftAbi, signer);

        const tokenIdBigInt = BigInt(selectedNft.tokenId);

        const approved = await nftContract.approve(nftMarket, tokenIdBigInt);
        await approved.wait();
        const tx = await contract.listNft(
          nftAdd,
          tokenIdBigInt,
          ethers.parseEther(price)
        );
        await tx.wait();
      } catch (error) {
        console.error("Error listing NFT:", error);
        toast.error("Transaction failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateNft = async () => {
    if (selectedNft && price) {
      try {
        setIsLoading(true);
        const nftMarket =
          nftMarketAddress[
            chainId?.toString() as keyof typeof nftMarketAddress
          ][0];
        const contract = new ethers.Contract(nftMarket, nftMarketAbi, signer);

        const nft =
          nftAddress[chainId?.toString() as keyof typeof nftAddress][0];
        const tokenIdBigInt = BigInt(selectedNft.tokenId);

        contract.once(
          "nftListed",
          async (owner, nftAddress, tokenId, price) => {
            console.log("owner", owner);
            console.log("nftAddress", nftAddress);
            console.log("tokenId", tokenId.toString());
            console.log("price", ethers.formatEther(price.toString()));
            const data = {
              tokenUri: selectedNft.tokenUri,
              tokenId: tokenId.toString(),
              owner,
              chainId: chainId?.toString(),
              status: "listed",
              price: ethers.formatEther(price).toString(),
            };
            await axios.post("/api/database-update", JSON.stringify(data));
            toast.success("NFT updated successfully");
            await fetchData();
            onClose();
          }
        );

        const tx = await contract.updateListing(
          nft,
          tokenIdBigInt,
          ethers.parseEther(price)
        );
        await tx.wait();
      } catch (error) {
        console.error("Error updating NFT:", error);
        toast.error("Transaction failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelNft = async () => {
    if (selectedNft) {
      try {
        setIsLoading(true);
        const nftMarket =
          nftMarketAddress[
            chainId?.toString() as keyof typeof nftMarketAddress
          ][0];
        const contract = new ethers.Contract(nftMarket, nftMarketAbi, signer);

        contract.once("nftCancelled", async (owner, nftAddress, tokenId) => {
          const data = {
            tokenUri: selectedNft.tokenUri,
            tokenId: tokenId.toString(),
            owner,
            chainId: chainId?.toString(),
            status: "unlisted",
            price: "",
          };

          await axios.post("/api/database-update", JSON.stringify(data));
          toast.success("NFT listing cancelled successfully");
          await fetchData();
          onClose();
        });

        const nft =
          nftAddress[chainId?.toString() as keyof typeof nftAddress][0];
        const tokenIdBigInt = BigInt(selectedNft.tokenId);

        const tx = await contract.cancelListing(nft, tokenIdBigInt);
        await tx.wait();
      } catch (error) {
        console.error("Error cancelling NFT:", error);
        toast.error("Transaction failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getProceeds = async () => {
    try {
      const nftMarket =
        nftMarketAddress[
          chainId?.toString() as keyof typeof nftMarketAddress
        ][0];
      const contract = new ethers.Contract(nftMarket, nftMarketAbi, signer);
      const proceeds = await contract.getProceeds(address);
      setProceeds(ethers.formatEther(proceeds));
    } catch (error) {
      console.error("Error getting proceeds:", error);
    }
  };

  const handleWithdraw = async () => {
    if (proceeds) {
      try {
        setIsLoading(true);
        const nftMarket =
          nftMarketAddress[
            chainId?.toString() as keyof typeof nftMarketAddress
          ][0];
        const contract = new ethers.Contract(nftMarket, nftMarketAbi, signer);
        const tx = await contract.withdrawProceeds();
        await tx.wait();
        toast.success("Proceeds withdrawn successfully");
        setProceeds("0.0");
      } catch (error) {
        console.error("Error withdrawing proceeds:", error);
        toast.error("Proceed withdrawn failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    getProceeds();
  }, []);

  const filteredNfts = nfts
    .filter((nft) => chainId?.toString() === nft.chainId)
    .filter((nft) => address === nft.owner)
    .filter((nft) => filter === nft.status)
    .sort((a, b) => Number(a.tokenId) - Number(b.tokenId));

  return (
    <>
      <div className="px-4">
        <div className="flex justify-end items-center pb-4 gap-3">
          <h1 className="text-xl">
            Balance Proceeds: <span className="font-bold">{proceeds} ETH</span>
          </h1>
          {parseFloat(proceeds) > 0 && (
            <Button
              onClick={handleWithdraw}
              color="success"
              isLoading={isLoading}
              className="text-white text-lg rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              Withdraw
            </Button>
          )}
        </div>
        <div className="mb-6 flex justify-between w-full space-x-2">
          <Button
            onClick={() => setFilter("unlisted")}
            className={`w-[50%] text-bold md:text-xl ${
              filter === "unlisted" ? "bg-[#A1A1AA] text-black" : ""
            }`}
          >
            Non Listed NFT
          </Button>
          <Button
            onClick={() => setFilter("listed")}
            className={`w-[50%] text-bold md:text-xl ${
              filter === "listed" ? "bg-[#A1A1AA] text-black" : ""
            }`}
          >
            Listed NFT
          </Button>
        </div>
        {isLoading ? (
          <div className="flex flex-wrap gap-4 justify-center md:justify-start items-center">
            <SkeletonComponent />
            <SkeletonComponent />
            <SkeletonComponent />
            <SkeletonComponent />
          </div>
        ) : filteredNfts.length === 0 ? (
          <p>No NFTs found</p>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center md:justify-start items-center">
            {filteredNfts.map((nft, index) => (
              <NftCard
                key={index}
                name={nft.name}
                owner={nft.owner}
                image={nft.image}
                description={nft.description}
                tokenId={nft.tokenId}
                price={nft.status === "listed" ? nft.price || "" : ""}
                onClickBtn={() => handleAction(nft)}
                BtnText={nft?.price ? "Update NFT" : "Sell NFT"}
              />
            ))}
          </div>
        )}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalBody>
              <p className="text-lg font-semibold mb-4">
                {selectedNft?.price
                  ? "Update your nft details"
                  : "Are you sure you want to sell this NFT?"}
              </p>
              {selectedNft && (
                <div className="mb-4">
                  <p className="font-bold text-xl">{selectedNft.name}</p>
                  <p className="text-gray-600 mb-2">
                    {selectedNft.description}
                  </p>
                  <img
                    src={`https://ipfs.io/ipfs/${selectedNft.image.replace(
                      "ipfs://",
                      ""
                    )}`}
                    alt={selectedNft.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <label className="block text-gray-700 mb-2">
                    Selling Price (in ETH):
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter price in ETH"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {!selectedNft?.price ? (
                <>
                  <Button onClick={onClose} className="mr-2">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSellNft}
                    color="primary"
                    isLoading={isLoading}
                  >
                    Sell NFT
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="primary"
                    isLoading={isLoading}
                    onClick={handleUpdateNft}
                  >
                    Update NFT
                  </Button>
                  <Button
                    color="danger"
                    isLoading={isLoading}
                    onClick={handleCancelNft}
                  >
                    Cancel Listing
                  </Button>
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
