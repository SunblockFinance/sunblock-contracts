// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
async function main() {
  await deployContract('cube');
  await deployContract('InvestmentVehicle');
}

async function deployContract(name) {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  const Contract = await ethers.getContractFactory(name);
  const contract = await Contract.deploy();

  console.log(`${name} address:`, contract.address);
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
