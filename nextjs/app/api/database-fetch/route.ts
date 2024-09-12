import dbConnect from "@/helpers/dbConnect";
import NFTModel from "@/model/NFT";
import { NextResponse } from "next/server";

export async function GET(){
    dbConnect();
    try {
        const nftDocuments = await NFTModel.find()
        return NextResponse.json({success:true,message:"Data fetched successfully",data:nftDocuments},{status: 200})
    } catch (error) {
        console.log(error);
        return NextResponse.json({success:false,message:"Error fetching data"},{status:500})
    }
}