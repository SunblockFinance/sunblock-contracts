// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");

let vehicleContract;
let usdtContract;
let owner;
let addr1;
let addr2;
let addrs;
let MANAGER_ROLE;
let UPGRADER_ROLE;
let PAUSER_ROLE;



describe("Upgrading contract", () => {

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    MANAGER_ROLE = ethers.utils.id("MANAGER_ROLE");
    UPGRADER_ROLE = ethers.utils.id("UPGRADER_ROLE");
    PAUSER_ROLE = ethers.utils.id("PAUSER_ROLE");

    const USDT = await ethers.getContractFactory("Tether");
    usdtContract = await USDT.deploy();
    await usdtContract.deployed();

    // Get the ContractFactory and Signers here.
    const Vehicle = await ethers.getContractFactory("InvestmentVehicle");
    vehicleContract = await upgrades.deployProxy(Vehicle, [usdtContract.address, 100], {
      initializer: "initialize",
      kind: "uups",
    });
    await vehicleContract.deployed();
  });

  it("Should upgrade contract without modifying data", async () => {
    // Adding test data in v1 contract
    await usdtContract.approve(vehicleContract.address, 2000);
    expect(await usdtContract.allowance(owner.address, vehicleContract.address)).to.equal(2000);
    await expect(() => vehicleContract.depositInvestment(owner.address, 100)).to.changeTokenBalance(
      usdtContract,
      vehicleContract,
      100
    );
    expect(await vehicleContract.investmentPool()).to.equal(100)

    const v2 = await ethers.getContractFactory("InvestmentVehicleV2UpgradeTest");
    const upgraded = await upgrades.upgradeProxy(vehicleContract.address, v2);
    await expect(upgraded.depositInvestment(owner.address, 100)).to.be.revertedWith('TESTING CONTRACT, DO NOT USE IN PROD')
    expect(await upgraded.investmentPool()).to.equal(100)
  });
});
