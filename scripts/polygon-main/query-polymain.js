// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const CUBE_ADDRESS = '0x21A281CE0258A9F7E38B6df5439F6E118BBAabCc'
const TOKEN_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const STRONG_NODE = '0xBBF075ADD207cbf1360d3E0bB0C8C81b016EE4c9'
const YIELD_NODE = '0x9f5f595018215754Bd64446d8F369eA0726fDFf9'

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
    console.log("")


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