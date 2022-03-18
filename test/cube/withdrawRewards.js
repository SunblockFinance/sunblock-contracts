// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

describe("Cube.collectRewards", function () {
  let cubeContract;
  let usdtContract;
  let vehicleContract;

  const BASIC_APPROVAL_AMOUNT_USDT = ethers.utils.parseUnits("200.0", 6);

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    MANAGER_ROLE = ethers.utils.id("MANAGER_ROLE");
    UPGRADER_ROLE = ethers.utils.id("UPGRADER_ROLE");
    PAUSER_ROLE = ethers.utils.id("PAUSER_ROLE");

    // SETUP TOKEN
    const USDT = await ethers.getContractFactory("Tether");
    usdtContract = await USDT.deploy();
    await usdtContract.deployed();

    // SETUP CUBE
    const Cube = await ethers.getContractFactory("cube");
    cubeContract = await upgrades.deployProxy(Cube, [usdtContract.address, ethers.utils.parseUnits("10.0", 6)], {
      initializer: "initialize",
      kind: "uups",
    });
    await cubeContract.deployed();

    // SETUP INVESTMENT VEHICLE
    const Vehicle = await ethers.getContractFactory("InvestmentVehicle");
    vehicleContract = await upgrades.deployProxy(Vehicle, [usdtContract.address, 100], {
      initializer: "initialize",
      kind: "uups",
    });
    await vehicleContract.deployed();
    await usdtContract.approve(vehicleContract.address, ethers.utils.parseUnits("2000.0", 6));
    expect(await usdtContract.allowance(owner.address, vehicleContract.address)).to.equal(
      ethers.utils.parseUnits("2000.0", 6)
    );
    await expect(() =>
      vehicleContract.depositReward(owner.address, ethers.utils.parseUnits("250.0", 6))
    ).to.changeTokenBalance(usdtContract, vehicleContract, ethers.utils.parseUnits("250.0", 6));
    await vehicleContract.depositInvestment(owner.address, ethers.utils.parseUnits("250.0", 6));
    vehicleContract.grantRole(ethers.utils.id("MANAGER_ROLE"), cubeContract.address);
  });

  console.log("here");
  it("Should increase balance of cube contract", async () => {
    await expect(() =>
      cubeContract.collectRewards(vehicleContract.address, ethers.utils.parseUnits("150.0", 6))
    ).to.changeTokenBalance(usdtContract, cubeContract, ethers.utils.parseUnits("150.0", 6));
    expect(await cubeContract.rewardsHeld()).to.be.equal(ethers.utils.parseUnits("150.0", 6));
  });
  it("Should NOT allow to withdraw more than what is available in vehicle", async () => {
    await expect(
      cubeContract.collectRewards(vehicleContract.address, ethers.utils.parseUnits("260.0", 6))
    ).to.be.revertedWith("Not enough balance in reward pool for withdrawal");
    expect(await cubeContract.rewardsHeld()).to.be.equal(ethers.utils.parseUnits("0", 6));
  });
  it("Should emit CollectedReward event on success", async () => {
    await expect(cubeContract.collectRewards(vehicleContract.address, ethers.utils.parseUnits("150.0", 6)))
      .to.emit(cubeContract, "CollectedReward")
      .withArgs(cubeContract.address, ethers.utils.parseUnits("150.0", 6), vehicleContract.address);
    expect(await cubeContract.rewardsHeld()).to.be.equal(ethers.utils.parseUnits("150.0", 6));
  });
  it("Should NOT allow for 0 amount collection", async () => {
    await expect(
      cubeContract.collectRewards(vehicleContract.address, ethers.utils.parseUnits("0", 6))
    ).to.be.revertedWith("Amount must be over 0");
    expect(await cubeContract.rewardsHeld()).to.be.equal(ethers.utils.parseUnits("0", 6));
  });
});
