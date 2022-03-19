// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployed contract with user ", deployer.address)
  let token = await deployToken();
  await deployCube(token);
  await deployVehicle('💪 Strong Block',token);
  await deployVehicle('🚜 Yield Farm',token);

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

  console.log(`Vehicle contract address:`, vehicleContract.address);
}

async function deployToken() {

    const [deployer] = await ethers.getSigners();

    const USDT = await ethers.getContractFactory('Tether')
  usdtContract = await USDT.deploy()
  await usdtContract.deployed()

    console.log(`Token contract address:`, usdtContract.address);
    return usdtContract.address
  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
