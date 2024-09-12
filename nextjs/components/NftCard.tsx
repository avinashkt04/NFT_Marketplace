"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Button,
  CardFooter,
  Tooltip,
} from "@nextui-org/react";
import { useMetaMask } from "@/context/MetamaskContext";
import { ethers } from "ethers";

export default function NftCard({
  name,
  owner,
  image,
  description,
  price,
  onClickBtn,
  BtnText,
  tokenId,
}: {
  name: string;
  owner: string;
  image: string;
  description: string;
  price: string;
  onClickBtn: () => void;
  BtnText: string;
  tokenId: string;
}) {
  const { address } = useMetaMask();

  const imageUri = `https://ipfs.io/ipfs/${image.replace("ipfs://", "")}`;

  const formattedOwner =
    address === owner ? "you" : `${owner.slice(0, 6)}...${owner.slice(-6)}`;

  // const formattedPrice = price ? ethers.formatEther(price) : "";

  return (
    <Card className="py-3 w-72">
      <CardHeader className="justify-between">
        <small className="text-default-500 mt-2 block">#{tokenId}</small>
        <Tooltip content={owner}>
          <p className="font-bold  pb-1 px-3 rounded-xl text-xs">
            owned by
            <span> {formattedOwner}</span>
          </p>
        </Tooltip>
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
          {price && <p className="font-bold text-large">{price} ETH</p>}
        </div>
        <small className="text-default-500 mt-2 block">{description}</small>
        <div className="mt-2 w-full">
          <Button color="primary" className="w-full" onClick={onClickBtn}>
            {BtnText}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
