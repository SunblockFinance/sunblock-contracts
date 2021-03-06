// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
// Copyright 2022 Kenth Fagerlund.

const { ethers } = require("hardhat")

// SPDX-License-Identifier: MIT
const CUBE_ADDRESS = '0x21A281CE0258A9F7E38B6df5439F6E118BBAabCc'
const TOKEN_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const STRONG_NODE = '0xBBF075ADD207cbf1360d3E0bB0C8C81b016EE4c9'
const YIELD_NODE = '0x9f5f595018215754Bd64446d8F369eA0726fDFf9'

async function depositReward(cubeContract, vehicleContract) {
    const [deployer] = await ethers.getSigners();

    const USDT = await ethers.getContractFactory("Tether")
    const usdt = await USDT.attach(TOKEN_ADDRESS)
    await usdt.approve(vehicleContract, ethers.utils.parseUnits('3000.0', 6))

    const IV = await ethers.getContractFactory("InvestmentVehicle");
    const iv = await IV.attach(vehicleContract);
    await iv.depositReward(deployer.address, ethers.utils.parseUnits('200.0',6))
}

async function withdrawReward(cubeContract, vehicleContract) {
    const [deployer] = await ethers.getSigners();

    const USDT = await ethers.getContractFactory("Tether")
    const usdt = await USDT.attach(TOKEN_ADDRESS)
    await usdt.approve(vehicleContract, ethers.utils.parseUnits('3000.0', 6))

    const CUBE = await ethers.getContractFactory("cube");
    const cube = await CUBE.attach(cubeContract);
    await cube.collectRewards(vehicleContract, ethers.utils.parseUnits('180.0', 6))

}

async function distributeRewards(cubeContract, vehicleContract) {
    const [deployer] = await ethers.getSigners();

    const CUBE = await ethers.getContractFactory("cube");
    const cube = await CUBE.attach(cubeContract);
    await cube.distributeRewards()

}






async function main() {
    // await depositReward(CUBE_ADDRESS, STRONG_NODE)
    // await withdrawReward(CUBE_ADDRESS, STRONG_NODE)
    await distributeRewards(CUBE_ADDRESS, STRONG_NODE)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
