// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT

async function getbalance() {
    const [deployer] = await ethers.getSigners();
    const IV = await ethers.getContractFactory("Tether");
    const iv = await IV.attach('0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1');
    const balance = await iv.balanceOf(deployer.address)
    console.log(`Balance of ${deployer.address} is ${balance}`);
}

async function main() {
    await getbalance()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });