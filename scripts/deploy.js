// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
async function main() {
  await deployCube();
  await deployVehicle();
}

async function deployCube() {
  const FUNDING_INSTRUMENT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; //<USDT> Address to the token that is used to buy shares
  const SHARE_PRICE_ETH = ethers.utils.parseUnits("10.0", 6);
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const Contract = await ethers.getContractFactory("cube");
  cubeContract = await upgrades.deployProxy(Contract, [FUNDING_INSTRUMENT_ADDRESS, SHARE_PRICE_ETH], {
    initializer: "initialize",
    kind: "uups",
  });
  await cubeContract.deployed();

  console.log(`Cube address:`, cubeContract.address);
}

async function deployVehicle() {
  const FUNDING_INSTRUMENT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; //<USDT> Address to the token that is used to buy shares

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const Vehicle = await ethers.getContractFactory("InvestmentVehicle");
  vehicleContract = await upgrades.deployProxy(Vehicle, [FUNDING_INSTRUMENT_ADDRESS, 100], {
    initializer: "initialize",
    kind: "uups",
  });
  await vehicleContract.deployed();

  console.log(`Vehicle contract address:`, vehicleContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
