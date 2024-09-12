import { NextRequest, NextResponse } from "next/server";
import { join, resolve } from "path";
import { writeFile, mkdir } from "fs/promises";
import { storeImage, storeTokenURIMetadata } from "@/helpers/uploadToPinata";
import { unlink } from "fs";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
};

export async function POST(request: NextRequest) {
  console.log("POST request received");

  const data = await request.formData();
  const image = data.get("image") as File;
  const name = data.get("name") as string;
  const description = data.get("description") as string;

  if (!image) {
    return NextResponse.json(
      { success: false, message: "No image file provided" },
      { status: 400 }
    );
  }

  console.log("Name:", name);
  console.log("Description:", description);
  try {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tmpDir = resolve("./public/temp");
    await mkdir(tmpDir, { recursive: true });

    const path = join(tmpDir, image.name);
    await writeFile(path, buffer);

    const tokenUri = await handleTokenUris(tmpDir, name, description);
    await unlink(path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("File deleted successfully");
      }
    });

    return NextResponse.json({ success: true, tokenUri: tokenUri });
  } catch (error) {
    console.error("Error handling file upload:", error);
    return NextResponse.json(
      { success: false, message: "Error handling file upload" },
      { status: 500 }
    );
  }
}

async function handleTokenUris(
  imagesLocation: string,
  name: string,
  description: string
): Promise<string> {
  const { responses: imageUploadResponses, files } =
    await storeImage(imagesLocation);

  const imageUploadResponse = imageUploadResponses[0];
  const file = files[0];

  let tokenUriMetadata = { ...metadataTemplate };
  tokenUriMetadata.name = name;
  tokenUriMetadata.description = description;
  tokenUriMetadata.image = `ipfs://${imageUploadResponse.IpfsHash}`;

  const metadataUploadResponse = await storeTokenURIMetadata(tokenUriMetadata);
  const tokenUri = `ipfs://${metadataUploadResponse?.IpfsHash}`;

  return tokenUri;
}
