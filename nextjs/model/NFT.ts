import {  model, Model, models, Schema } from "mongoose";

export interface NFT extends Document {
    tokenUri: string;
    tokenId: string;
    owner: string;
    status: string;
    chainId: string;
    price: string;
    createdAt: Date;
}

const nftSchema: Schema<NFT> = new Schema({
    tokenUri: {
        type: String,
        required: true,
    },
    tokenId: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        option: ["listed", "unlisted"],
        default: "unlisted",
    },
    chainId: {
        type: String,
        required: true,
    },
    price: {
        type: String
    }
}, { timestamps: true });

const NFTModel = (models?.NFT as Model<NFT>) || model<NFT>("NFT", nftSchema);

export default NFTModel;
