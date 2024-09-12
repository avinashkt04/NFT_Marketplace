"use client";

import NftCard from "@/components/NftCard";
import { useMetaMask } from "@/context/MetamaskContext";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import nftAddress from "@/constants/nftAddress.json";
import nftMarketAddress from "@/constants/nftMarketAddress.json";
import nftMarketAbi from "@/constants/nftMarketAbi.json";
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

export default function MarketplacePage() {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
  const [price, setPrice] = useState<string>("");

  const { address, chainId, signer } = useMetaMask();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/database-fetch");
      let nftData: Nft[] = [];

      for (let nft of response.data?.data) {
        const ipfsHash = nft.tokenUri.replace("ipfs://", "");
        const tokenUriURL = `https://ipfs.io/ipfs/${ipfsHash}`;

        try {
          const tokenUriResponse = await axios.get(tokenUriURL);
          nftData.push({
            tokenUri: nft.tokenUri,
            name: tokenUriResponse?.data.name,
            description: tokenUriResponse?.data.description,
            image: tokenUriResponse?.data.image,
            tokenId: nft.tokenId,
            owner: nft.owner,
            chainId: nft.chainId,
            status: nft.status,
            price: nft.price,
          });
        } catch (error) {
          console.error("Error fetching token URI:", error);
        }
      }
      setNfts(nftData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching NFT data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = (nft: Nft) => {
    setSelectedNft(nft);
    setPrice(nft.price || "");
    onOpen();
  };

  const handleBuyNft = async () => {
    if (selectedNft) {
      try {
        setIsLoading(true);
        const nftMarket =
          nftMarketAddress[
            chainId?.toString() as keyof typeof nftMarketAddress
          ][0];
        const nft =
          nftAddress[chainId?.toString() as keyof typeof nftAddress][0];

        const contract = new ethers.Contract(nftMarket, nftMarketAbi, signer);

        contract.once(
          "nftBought",
          async (seller, nftAddress, tokenId, price) => {
            console.log(`NFT bought from ${seller}`);
            console.log(`NFT Address: ${nftAddress}`);
            console.log(`Token ID: ${tokenId}`);
            console.log(`Price: ${price.toString()}`);

            const data = {
              tokenUri: selectedNft.tokenUri,
              tokenId: selectedNft.tokenId,
              owner: address,
              chainId: chainId,
              status: "unlisted",
              price: "",
            };

            await axios.post("/api/database-update", data);
            await fetchData();
            toast.success("NFT bought successfully");
          }
        );

        const tokenIdBigInt = BigInt(selectedNft.tokenId);
        const priceInBigInt = ethers.parseEther(price);
        const priceInWei = BigInt(priceInBigInt || "0");

        const tx = await contract.buyNft(nft, tokenIdBigInt, {
          value: priceInWei,
        });
        await tx.wait();
        onClose();
      } catch (error) {
        console.error("Error buying NFT:", error);
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
            await fetchData();
            toast.success("NFT updated successfully");
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
          console.log("owner", owner);
          console.log("nftAddress", nftAddress);
          console.log("tokenId", tokenId.toString());
          const data = {
            tokenUri: selectedNft.tokenUri,
            tokenId: tokenId.toString(),
            owner,
            chainId: chainId?.toString(),
            status: "unlisted",
            price: "",
          };

          await axios.post("/api/database-update", JSON.stringify(data));
          await fetchData();
          toast.success("NFT listing canceled successfully");
          onClose();
        });

        const nft =
          nftAddress[chainId?.toString() as keyof typeof nftAddress][0];
        const tokenIdBigInt = BigInt(selectedNft.tokenId);

        const tx = await contract.cancelListing(nft, tokenIdBigInt);
        await tx.wait();
      } catch (error) {
        console.error("Error canceling NFT:", error);
        toast.error("Transaction failed");
      }
    }
  };

  const filteredNfts = nfts
    .filter((nft) => chainId?.toString() === nft.chainId)
    .filter((nft) => nft.status === "listed");

  return (
    <div className="px-4">
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
              BtnText={nft.owner === address ? "Update NFT" : "Buy NFT"}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalBody>
            <p className="text-lg font-semibold mb-4">
              {selectedNft?.owner === address
                ? "Update your nft details"
                : "Are you sure you want to buy this NFT?"}
            </p>
            {selectedNft && (
              <div className="mb-4">
                <p className="font-bold text-xl">{selectedNft.name}</p>
                <p className="text-gray-600 mb-2">{selectedNft.description}</p>
                <img
                  src={`https://ipfs.io/ipfs/${selectedNft.image.replace(
                    "ipfs://",
                    ""
                  )}`}
                  alt={selectedNft.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />

                {selectedNft.owner !== address ? (
                  <label className="block  mb-2">Price: {price} ETH</label>
                ) : (
                  <>
                    <label className="block mb-2">
                      Selling Price (in ETH):
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Enter price in ETH"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedNft?.owner !== address ? (
              <>
                <Button onClick={onClose} className="mr-2">
                  Cancel
                </Button>
                <Button
                  onClick={handleBuyNft}
                  color="primary"
                  isLoading={isLoading}
                >
                  Buy NFT
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
  );
}
