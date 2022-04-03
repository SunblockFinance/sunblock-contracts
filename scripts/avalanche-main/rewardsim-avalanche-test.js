// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
// Copyright 2022 Kenth Fagerlund.

const { ethers } = require("hardhat")

// SPDX-License-Identifier: MIT
const CUBE_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const STRONG_NODE = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
const YIELD_FARM = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'

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
