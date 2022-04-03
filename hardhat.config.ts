import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import * as dotenv from "dotenv"
import "hardhat-gas-reporter"
import "solidity-coverage"


require('@openzeppelin/hardhat-upgrades');

dotenv.config();

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
  gasReporter: {
    enabled: true,
    currency: "USD",
    token: 'AVAX',
    coinmarketcap: process.env.COINMARKET_KEY,
    gasPriceApi: 'https://api.snowtrace.io/api?module=proxy&action=eth_gasPrice',
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      polygon: process.env.POLYSCAN_KEY,
      polygonMumbai: process.env.POLYSCAN_KEY,
      avalanche: process.env.AVAXMAIN_KEY,
      avalancheFujiTestnet: process.env.AVAXFUJI_KEY
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
    avaxFuji: {
      chainId:43113,
      url: process.env.AVAXFUJI_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
    avaxMain: {
      chainId:43114,
      gasPrice: 'auto',
      gasMultiplier: 1,
      url: process.env.AVAXMAIN_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
}
