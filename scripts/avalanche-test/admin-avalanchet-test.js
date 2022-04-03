// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const CUBE_ADDRESS = '0x9e937413A629Eb060461589E1Ba8e17A0E41f4Db'
const TOKEN_ADDRESS = '0x020E3EB05a80aB431F37171Fa5Bd0f175E62Ca0F'
const STRONG_NODE = '0x5a2632E4125e3f1d5E19095E458D2E47da36350D'
const YIELD_FARM = '0xE1eb7199A220AefF4F8Cc0559c69b4cB7144f73f'

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
    // await makeCubeOwnerOfVehicle('0x1A814C71D5DCE40Eac810961Cd3Cabf6aDd859E6', STRONG_NODE)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
