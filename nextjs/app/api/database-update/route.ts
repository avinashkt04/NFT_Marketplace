import dbConnect from "@/helpers/dbConnect";
import NFTModel from "@/model/NFT";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const { tokenUri, tokenId, owner, chainId, status, price } = await request.json();

        console.log("Token URI:", tokenUri);
        console.log("Token ID:", tokenId);
        console.log("Owner:", owner);
        console.log("Status:", status);
        console.log("Price:", price);

        if (!tokenUri || !tokenId || !owner) {
            return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });
        }

        let nft;

        nft = await NFTModel.findOne({ tokenId, chainId });
        if (nft) {
            nft.status = status || nft.status;
            if (nft.status === "listed" && price) {
                nft.price = price;
            } else {
                nft.price = ""; 
            }
            nft.owner = owner;
        } else {
            nft = new NFTModel({
                tokenUri,
                tokenId,
                owner,
                chainId,
                status: status || "unlisted",
            });

            if (status === "listed" && price) {
                nft.price = price;
            }
        }

        await nft.save();

        return NextResponse.json({ success: true, message: "Data uploaded successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: "Error uploading data" }, { status: 500 });
    }
}
