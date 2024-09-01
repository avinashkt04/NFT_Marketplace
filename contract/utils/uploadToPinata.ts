// import pinataSDK, { PinataPinResponse } from "@pinata/sdk";
// import path from "path";
// import fs from "fs";
// import "dotenv/config";

// const pinataApiKey: string = process.env.PINATA_API_KEY!;
// const pinataSecretApiKey: string = process.env.PINATA_SECRET_API_KEY!;

// const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);

// async function storeImage(imageFilePath: string) {
//   const fullImagePath: string = path.resolve(imageFilePath);
//   const file: string = fs.readdirSync(fullImagePath);
//   let responses: PinataPinResponse[] = [];
//   console.log("Uploading file to Pinata...");
//   console.log(`File - ${file}`);
//   // for (const fileIndex in files) {
//     // console.log(`Uploading file - ${files[fileIndex]}`);
//     const readableStreamForFile = fs.createReadStream(
//       `${fullImagePath}/${file}`
//     );
//     try {
//       const response = await pinata.pinFileToIPFS(readableStreamForFile, {
//         pinataMetadata: {
//           name: files[fileIndex],
//         },
//       });
//       responses.push(response);
//     } catch (error) {
//       console.log(`Error uploading file - ${files[fileIndex]}`);
//       console.log(error);
//     }
//   }
// }

// async function storeTokenURIMetadata(metadata: any) {
//   try {
//     const response = await pinata.pinJSONToIPFS(metadata);
//     console.log("Metadata uploaded to Pinata");
//     return response;
//   } catch (error) {
//     console.log("Error uploading metadata to Pinata");
//     console.log(error);
//   }
// }

// export = { storeImage, storeTokenURIMetadata };