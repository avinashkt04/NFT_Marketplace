"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import Image from "next/image";

const featuredNfts = [
  {
    name: "Financial Bull",
    description: "a financial bull nft",
    imageUri: "/financial bull.jpg",
  },
  {
    name: "Cyberpunk",
    description: "Neon-lit Nightscape",
    imageUri: "/cyberpunk.jpg",
  },
  {
    name: "Neon Vibes",
    description: "Cybernetic Neon Vibes",
    imageUri: "/cyberpunk_2.jpg",
  },
];

type NftCardProps = {
  name: string;
  description: string;
  imageUri: string;
};

const NftCard: React.FC<NftCardProps> = ({ name, description, imageUri }) => {
  return (
    <Card className="py-3 w-72">
      <CardHeader className="justify-between">
        <small className="text-default-500 mt-2 block">#0</small>
        <p className="font-bold pb-1 px-3 rounded-xl text-xs">
          owned by
          <span>0x0000...000000</span>
        </p>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt={name}
          className="object-cover rounded-xl"
          src={imageUri}
          width={270}
          height={270}
        />
      </CardBody>
      <CardFooter className="pb-0 pt-2 px-4 flex-col items-center">
        <div className="flex justify-between items-center w-full">
          <h4 className="font-bold text-large">{name}</h4>
          <p className="font-bold text-large">XX ETH</p>
        </div>
        <small className="text-default-500 mt-2 block">{description}</small>
        <div className="mt-2 w-full">
          <Button color="primary" className="w-full" isDisabled>
            Buy NFT
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function HeroSection() {
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const texts = ["NFTSpace", "a Digital Marketplace", "a Creative Hub"];

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const typeEffect = () => {
      if (charIndex < texts[textIndex].length) {
        setCurrentText((prev) => prev + texts[textIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      } else {
        clearInterval(intervalId!);
        setTimeout(() => {
          setCurrentText("");
          setCharIndex(0);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }, 1000);
      }
    };

    intervalId = setInterval(typeEffect, 100);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [charIndex, textIndex, texts]);

  return (
    <>
      <section className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-r from-gray-600 to-slate-700">
        <h1 className="text-2xl md:text-5xl font-bold text-white">
          Welcome to <span className="text-cyan-300">{currentText}</span>
          <span className="blink-cursor">|</span>
        </h1>
        <p className="text-lg md:text-2xl text-white mt-4 md:font-semibold">
          Discover, create, and trade unique digital assets
        </p>
        <p className="text-lg text-white mt-4 px-4 md:px-8">
          Join a vibrant community of creators and collectors. Our platform
          offers powerful tools to bring your digital creations to life and
          connect with enthusiasts from around the world. Whether you're an
          artist or a collector, NFTSpace is your gateway to a thriving digital
          marketplace.
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/marketplace"
            className="bg-white text-black px-6 py-3 rounded-full transition-transform duration-300 hover:scale-105"
          >
            Explore NFTs
          </Link>
          <Link
            href="/create"
            className="bg-transparent border-white border-2 hover:bg-white hover:text-black text-white px-6 py-3 rounded-full transition-transform duration-300 hover:scale-105"
          >
            Create NFT
          </Link>
        </div>
      </section>

      <section className="py-20">
        <h2 className="text-4xl font-bold text-center mb-10">Featured NFTs</h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
            {featuredNfts.map((nft) => (
              <NftCard
                key={nft.name}
                name={nft.name}
                description={nft.description}
                imageUri={nft.imageUri}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-around items-center">
          <div className="max-w-xs">
            <img
              src="/metamask.webp"
              alt="Connect Wallet"
              className="w-40 h-40 object-cover mx-auto"
            />
            <h3 className="text-xl font-semibold mt-4">Connect Wallet</h3>
            <p className="mt-2 text-gray-600">
              Begin by connecting your wallet using MetaMask or other supported
              wallets. This allows you to interact with the NFT marketplace
              securely and easily.
            </p>
          </div>
          <div className="max-w-xs">
            <img
              src="/create_Nft.png"
              alt="Create NFT"
              className="w-40 h-40 object-cover mx-auto"
            />
            <h3 className="text-xl font-semibold mt-4">Create NFT</h3>
            <p className="mt-2 text-gray-600">
              Upload your digital art, provide a name and description, and mint
              it as an NFT. Ensure you include all the necessary details to make
              your NFT stand out.
            </p>
          </div>
          <div className="max-w-xs">
            <img
              src="/marketplace.png"
              alt="Explore NFTs"
              className="w-40 h-40 object-cover mx-auto"
            />
            <h3 className="text-xl font-semibold mt-4">Explore & Trade</h3>
            <p className="mt-2 text-gray-600">
              Browse our marketplace to discover unique digital assets. You can
              buy, sell, and trade NFTs with other collectors from around the
              world.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-6 bg-black text-white text-center border-t border-slate-800">
        <p className=" text-sm md:text-md">
          &copy; {new Date().getFullYear()} NFTSpace. All rights reserved.
        </p>
      </footer>
    </>
  );
}
