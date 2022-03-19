// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

describe("Cube.setInvestmentTarget", () => {
  let cubeContract;
  let usdtContract;
  let vehicleContract;

  const BASIC_APPROVAL_AMOUNT_USDT = ethers.utils.parseUnits("200.0", 6);
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
    vehicleContract = await upgrades.deployProxy(Vehicle, [ethers.utils.formatBytes32String('test name 👍'),usdtContract.address, 100], {
      initializer: "initialize",
      kind: "uups",
    });
    await vehicleContract.deployed();
    await vehicleContract.grantRole(ethers.utils.id('MANAGER_ROLE'), cubeContract.address)
  });

  it("Should be trigger funding when adding vechicle with funding below current invested amount", async () => {
    expect(await cubeContract.currentVehicle()).to.be.equal(ZERO_ADDRESS);
    expect(await cubeContract.currentTargetAmount()).to.be.equal(0);
    expect(await cubeContract.nextVehicle()).to.be.equal(ZERO_ADDRESS);
    expect(await cubeContract.nextTargetAmount()).to.be.equal(0);
    expect(await cubeContract.setInvestmentTarget(vehicleContract.address, ethers.utils.parseUnits("20.0", 6)));
    expect(await cubeContract.currentVehicle()).to.be.equal(vehicleContract.address);
    expect(await cubeContract.currentTargetAmount()).to.be.equal(ethers.utils.parseUnits("20.0", 6));
    expect(await cubeContract.nextVehicle()).to.be.equal(ZERO_ADDRESS);
    expect(await cubeContract.nextTargetAmount()).to.be.equal(0);
  });
  it("Should add next Vehicle if current is already set", async () => {
    expect(await cubeContract.currentVehicle()).to.be.equal(ZERO_ADDRESS);
    expect(await cubeContract.currentTargetAmount()).to.be.equal(0);
    expect(await cubeContract.nextVehicle()).to.be.equal(ZERO_ADDRESS);
    expect(await cubeContract.nextTargetAmount()).to.be.equal(0);
    expect(await cubeContract.setInvestmentTarget(vehicleContract.address, ethers.utils.parseUnits("20.0", 6)));
    expect(await cubeContract.currentVehicle()).to.be.equal(vehicleContract.address);
    expect(await cubeContract.currentTargetAmount()).to.be.equal(ethers.utils.parseUnits("20.0", 6));
    expect(await cubeContract.nextVehicle()).to.be.equal(ZERO_ADDRESS);
    expect(await cubeContract.nextTargetAmount()).to.be.equal(0);
    expect(await cubeContract.setInvestmentTarget(vehicleContract.address, ethers.utils.parseUnits("30.0", 6)));
    expect(await cubeContract.currentVehicle()).to.be.equal(vehicleContract.address);
    expect(await cubeContract.currentTargetAmount()).to.be.equal(ethers.utils.parseUnits("20.0", 6));
    expect(await cubeContract.nextVehicle()).to.be.equal(vehicleContract.address);
    expect(await cubeContract.nextTargetAmount()).to.be.equal(ethers.utils.parseUnits("30.0", 6));
  });
  it("Should trigger funding of vehicle when target amount exceeded", async () => {

    expect(await cubeContract.setInvestmentTarget(vehicleContract.address, ethers.utils.parseUnits("800.0", 6)));
    expect(await usdtContract.balanceOf(cubeContract.address)).be.equal(0)
    expect(await usdtContract.approve(cubeContract.address, ethers.utils.parseUnits('10000.0', 6)))
    expect(await cubeContract.buyShares(100))
    expect(await usdtContract.balanceOf(cubeContract.address)).be.equal(ethers.utils.parseUnits('200.0', 6))
  })
});
