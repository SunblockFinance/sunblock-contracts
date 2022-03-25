// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const CUBE_ADDRESS = '0x21A281CE0258A9F7E38B6df5439F6E118BBAabCc'
const TOKEN_ADDRESS = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
const STRONG_NODE = '0xBBF075ADD207cbf1360d3E0bB0C8C81b016EE4c9'
const YIELD_NODE = '0x9f5f595018215754Bd64446d8F369eA0726fDFf9'

async function makeCubeOwnerOfVehicle(cubeContract, vehicleContract) {
  try {
    const [deployer] = await ethers.getSigners();
    const IV = await ethers.getContractFactory("InvestmentVehicle");
    const iv = await IV.attach(vehicleContract);
    await iv.grantRole(ethers.utils.id("MANAGER_ROLE"), cubeContract)
    const result = await iv.hasRole(ethers.utils.id("MANAGER_ROLE"), cubeContract)
    console.log("Has cube been granted manager? ", result)
  } catch (error) {
    console.log(error);
  }


}


async function setInvestmentVehicleForCube(cubeContract, vehicleContract, targetAmountWei) {
  try {
    console.log(`Cube ${cubeContract}`);
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
  } catch (error) {
    console.log(error);
  }

}

async function main() {
    // await setInvestmentVehicleForCube(CUBE_ADDRESS, STRONG_NODE, ethers.utils.parseUnits("1300.0", 6))
    await setInvestmentVehicleForCube(CUBE_ADDRESS, YIELD_NODE, ethers.utils.parseUnits("600.0", 6))
    // await makeCubeOwnerOfVehicle(CUBE_ADDRESS, STRONG_NODE)
    await makeCubeOwnerOfVehicle(CUBE_ADDRESS, YIELD_NODE)
    // await makeCubeOwnerOfVehicle('0x1A814C71D5DCE40Eac810961Cd3Cabf6aDd859E6', STRONG_NODE)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
