require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
require('solidity-coverage')
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();


  for (const account of accounts) {
    console.log(account.address);
  }
});


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      polygon: process.env.POLYSCAN_KEY,
      polygonMumbai: process.env.POLYSCAN_KEY,
    }
  },
  networks: {
    polygonMumbai: {
      chainId:80001,
      url: process.env.MUMBAI_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygonMain: {
      chainId:137,
      url: process.env.POLYMAIN_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
}
