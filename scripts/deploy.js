const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  // console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", balance.toString());

  // Deploy Marketplace contract
  const Marketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.deployed();
  console.log("Marketplace deployed to:", marketplace.address);

  // Prepare and write the ABI and address for Marketplace contract
  const marketplaceData = {
    address: marketplace.address,
    abi: JSON.parse(marketplace.interface.format('json'))
  }
  fs.writeFileSync('./src/Marketplace.json', JSON.stringify(marketplaceData, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
