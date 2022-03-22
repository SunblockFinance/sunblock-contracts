// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const CUBE_ADDRESS = '0x8219dbc987b90FdB1D180a38CD931b080CD85DE3'
const TOKEN_ADDRESS = '0x7c7bFAC4C4962328c03BfBe19bf17FeEd8178c7f'
const STRONG_NODE = '0x6DD148B6cF17E2B3D9c3d21799e59B554363fF30'
const YIELD_FARM = '0x3C902d0a3Fb1C8a29ebfF12f30AC6a6C93cD9F6d'

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
