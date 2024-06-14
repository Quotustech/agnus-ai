require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const fs = require('fs');

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    agnusai: {
      chainId: 1100, 
      url: `https://rpc.agnscan.com/`,
      accounts: [ "1fd081a5bf9634d3834e7344baac25ea5f70cb556f0dc19acff0472324a80aeb" ]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};


//https://sepolia.infura.io/v3/8d9c58e60d57449c97e6152d9c21d1b9