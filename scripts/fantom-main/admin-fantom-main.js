// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const CUBE_ADDRESS = '0xF054c307A72bbe7b5E6D7831C04bFc6E93f97eA4'
const TOKEN_ADDRESS = '0x049d68029688eabf473097a2fc38ef61633a3c7a'
const SPOOKY_SWAP = '0xbB360b04a49786EeCeFf029bb89bD0218bea6baA'

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
    await setInvestmentVehicleForCube(CUBE_ADDRESS, SPOOKY_SWAP, ethers.utils.parseUnits("500.0", 6))
    // await setInvestmentVehicleForCube(CUBE_ADDRESS, SPOOKY_SWAP, ethers.utils.parseUnits("1200.0", 6))
    await makeCubeOwnerOfVehicle(CUBE_ADDRESS, SPOOKY_SWAP)
    // await makeCubeOwnerOfVehicle(CUBE_ADDRESS, YIELD_FARM)
    // await makeCubeOwnerOfVehicle('0x1A814C71D5DCE40Eac810961Cd3Cabf6aDd859E6', STRONG_NODE)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
