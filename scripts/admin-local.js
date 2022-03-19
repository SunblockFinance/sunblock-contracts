// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const CUBE_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const STRONG_NODE = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
const YIELD_FARM = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'

async function makeCubeOwnerOfVehicle(cubeContract, vehicleContract) {
    const [deployer] = await ethers.getSigners();
    const IV = await ethers.getContractFactory("InvestmentVehicle");
    const iv = await IV.attach(vehicleContract);
    await iv.grantRole(ethers.utils.id("MANAGER_ROLE"), cubeContract)
    const result = await iv.hasRole(ethers.utils.id("MANAGER_ROLE"), cubeContract)
    console.log("Has cube been granted manager? ", result)
}


async function setInvestmentVehicleForCube(cubeContract, vehicleContract, targetAmountWei) {
    const [deployer] = await ethers.getSigners();
    const Cube = await ethers.getContractFactory("cube");
    const cube = await Cube.attach(cubeContract);
    await cube.setInvestmentTarget(vehicleContract, targetAmountWei)
    const currentVehicle = await cube.currentVehicle()
    const currentAmount = await cube.currentTargetAmount()
    const nextVehicle = await cube.nextVehicle()
    const nextAmount = await cube.nextTargetAmount()
    console.log("Target vehicle is set to : ", currentVehicle)
    console.log("Target amount is ", currentAmount)
    console.log("Next vehicle is set to : ", nextVehicle)
    console.log("Next amount is ", nextAmount)
}

async function main() {
    await setInvestmentVehicleForCube(CUBE_ADDRESS, STRONG_NODE, ethers.utils.parseUnits("800.0", 6))
    await setInvestmentVehicleForCube(CUBE_ADDRESS, YIELD_FARM, ethers.utils.parseUnits("1200.0", 6))
    await makeCubeOwnerOfVehicle(CUBE_ADDRESS, STRONG_NODE)
    await makeCubeOwnerOfVehicle(CUBE_ADDRESS, YIELD_FARM)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
