// Copyright 2022 Kenth Fagerlund.

const { ethers } = require("hardhat")

const USDT_TOKEN_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'

// SPDX-License-Identifier: MIT
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployed contract with user ", deployer.address)
  // await deployCube(USDT_TOKEN_ADDRESS);
  // await deployVehicle('Strongblock',USDT_TOKEN_ADDRESS);
  await deployVehicle('Yieldnodes',USDT_TOKEN_ADDRESS);


}

async function deploySunburn() {
  // const FUNDING_INSTRUMENT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; //<USDT> Address to the token that is used to buy shares

  const [deployer] = await ethers.getSigners();

  const SUNBURN = await ethers.getContractFactory("Sunburn");
  const sunburn = await SUNBURN.deploy()
  await sunburn.deployed();

  console.log(`Sunburn address:`, sunburn.address);
  return sunburn.address
}

async function deployGovenor(token) {
  // const FUNDING_INSTRUMENT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; //<USDT> Address to the token that is used to buy shares

  const [deployer] = await ethers.getSigners();

  const FREYR = await ethers.getContractFactory("Freyr");
  const freyr = await FREYR.deploy(token)
  await freyr.deployed();

  console.log(`Govenor address:`, freyr.address);
}

async function deployCube(token) {
  // const FUNDING_INSTRUMENT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; //<USDT> Address to the token that is used to buy shares
  const SHARE_PRICE_ETH = ethers.utils.parseUnits("10.0", 6);
  const [deployer] = await ethers.getSigners();

  const Contract = await ethers.getContractFactory("cube");
  cubeContract = await upgrades.deployProxy(Contract, [token, SHARE_PRICE_ETH], {
    initializer: "initialize",
    kind: "uups",
  });
  await cubeContract.deployed();

  console.log(`Cube address:`, cubeContract.address);
}

async function deployVehicle(name, token) {
  // const FUNDING_INSTRUMENT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; //<USDT> Address to the token that is used to buy shares

  const [deployer] = await ethers.getSigners();

  const Vehicle = await ethers.getContractFactory("InvestmentVehicle");
  vehicleContract = await upgrades.deployProxy(Vehicle, [ethers.utils.formatBytes32String(name), token, 100], {
    initializer: "initialize",
    kind: "uups",
  });
  await vehicleContract.deployed();

  console.log(`Vehicle ${name} contract address:`, vehicleContract.address);
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
