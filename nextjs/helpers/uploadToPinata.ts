import pinataSDK, { PinataPinResponse } from "@pinata/sdk";
import path from "path";
import fs from "fs";

const pinataApiKey: string = process.env.PINATA_API_KEY!;
const pinataSecretApiKey: string = process.env.PINATA_SECRET_API_KEY!;

const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);

type PinataPinResponseType = {
  responses: PinataPinResponse[];
  files: string[];
};

export async function storeImage(
  imageFilePath: string
): Promise<PinataPinResponseType> {
  console.log(`Image file path: ${imageFilePath}`);
  const fullImagePath: string = path.resolve(imageFilePath);
  console.log(`Full image path: ${fullImagePath}`);
  const files: string[] = fs.readdirSync(fullImagePath);
  console.log(`Files: ${files}`);
  let responses: PinataPinResponse[] = [];
  console.log("Uploading files to Pinata...");

  for (const file of files) {
    console.log(`Uploading file - ${file}`);
    const readableStreamForFile = fs.createReadStream(
      `${fullImagePath}/${file}`
    );

    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile, {
        pinataMetadata: {
          name: file,
        },
      });
      responses.push(response);
    } catch (error) {
      console.log(`Error uploading file - ${file}`);
      console.log(error);
    }
  }
  console.log(`Responses: ${JSON.stringify(responses)}`);
  return { responses, files };
}

export async function storeTokenURIMetadata(
  metadata: any
): Promise<PinataPinResponse | undefined> {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    console.log("Metadata uploaded to Pinata");
    return response;
  } catch (error) {
    console.log("Error uploading metadata to Pinata");
    console.log(error);
  }
}
