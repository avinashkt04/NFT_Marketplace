import { run } from "hardhat";

async function verify(contractAddress: string, args: any) {
  console.log("Verifying contract on Etherscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified");
    } else {
      console.log("Error verifying contract:", error);
    }
  }
}

export { verify };
