// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const CUBE_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const VEHICLE_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
const TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

async function getStats(cubeContract, vehicleContract) {
    const [deployer] = await ethers.getSigners();
    const IV = await ethers.getContractFactory("InvestmentVehicle");
    const iv = await IV.attach(vehicleContract);
    console.log(" ==== VEHICLE ==== ");
    console.log("Investment Pool:", await iv.investmentPool())
    console.log("Management Pool:", await iv.feePool())
    console.log("Reward Pool:", await iv.rewardPool())
    console.log(" ==== VEHICLE ==== ");
    console.log("")
    console.log("")
    console.log("")

    const Cube = await ethers.getContractFactory("cube");
    const cube = await Cube.attach(cubeContract);
    console.log(" ==== CUBE ==== ");
    console.log("Investment Held:", await cube.investmentHeld())
    console.log("Rewards Held:", await cube.rewardsHeld())
    console.log("Current Vehicle:", await cube.currentVehicle())
    console.log("Current Target Amount:", await cube.currentTargetAmount())
    console.log("Next Vehicle:", await cube.nextVehicle())
    console.log("Next Target Amount:", await cube.nextTargetAmount())
    console.log("Shares Issued:", await cube.sharesIssued())
    console.log("Unit Cost:", await cube.unitcost())
    console.log(" ==== CUBE ==== ");
}



async function main() {
    await getStats(CUBE_ADDRESS,VEHICLE_ADDRESS)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });