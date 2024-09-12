"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@nextui-org/react";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { useMetaMask } from "@/context/MetamaskContext";
import { ethers } from "ethers";
import nftAddress from "@/constants/nftAddress.json";
import nftAbi from "@/constants/nftAbi.json";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CreatePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { chainId, address, signer } = useMetaMask();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue("image", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    setImagePreview(null);
    setValue("image", null);
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("image", data.image);

    try {
      setIsLoading(true);
      const response = await axios.post("/api/create-nft", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { tokenUri } = response.data;

      try {
        const nft =
          nftAddress[chainId?.toString() as keyof typeof nftAddress][0];
        const contract = new ethers.Contract(nft, nftAbi, signer);

        contract.once("nftCreated", async (owner, tokenId, tokenUri) => {
          const data = {
            tokenUri,
            tokenId: tokenId.toString(),
            owner,
            chainId: chainId?.toString(),
          };

          await axios.post("/api/database-update", JSON.stringify(data));
          setIsLoading(false);
          reset();
          handleDelete();
          toast.success("NFT created successfully");
        });

        const tx = await contract.createNFT(tokenUri);
        await tx.wait();
      } catch (error) {
        console.error("Error creating NFT:", error);
        toast.error("Transaction failed");
      }
    } catch (error) {
      console.error("Error uploading data:", error);
      toast.error("Internal server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-2xl font-bold">Create an NFT</div>
      <p>
        Once one item is minted you will not be able to change its information.
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="md:flex justify-between"
      >
        <div className="md:w-[50%] relative h-60 md:h-96 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] my-4 overflow-hidden">
          {imagePreview ? (
            <div className="relative h-full w-full hover:opacity-60">
              <img
                src={imagePreview}
                alt="image"
                className="h-full w-full object-cover rounded-lg"
              />
              <button
                onClick={handleDelete}
                type="button"
                className="absolute top-2 right-2 p-1 rounded-full text-black"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ) : (
            <label
              htmlFor="image"
              className="cursor-pointer w-full h-full flex justify-center items-center flex-col font-bold"
            >
              <i className="fa-solid fa-arrow-up-from-bracket text-xl"></i>
              Upload media file
              <p className="font-thin text-xs">JPG, PNG, SVG, GIF</p>
            </label>
          )}
          <input
            type="file"
            accept=".jpg, .jpeg, .png, .svg"
            id="image"
            hidden
            onChange={handleChange}
          />
        </div>
        <div className="md:w-[40%] py-4 space-y-4">
          <div className="w-full flex-wrap md:flex-nowrap space-y-2">
            <label className="font-bold">Name *</label>
            <Input
              type="text"
              size="lg"
              className="w-full h-10"
              {...register("name")}
            />
          </div>
          <div className="w-full flex-wrap md:flex-nowrap space-y-2">
            <label className="font-bold">Description</label>
            <Textarea
              isRequired
              placeholder="Enter your description"
              size="lg"
              {...register("description")}
            />
          </div>
          <Button
            color="primary"
            size="lg"
            className="w-full"
            type="submit"
            isLoading={isLoading}
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
