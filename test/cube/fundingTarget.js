// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

let cubeContract
let usdtContract
let vehicleContract

const BASIC_APPROVAL_AMOUNT_USDT = ethers.utils.parseUnits("200.0", 6)
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

beforeEach(async function () {
    ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()

    MANAGER_ROLE = ethers.utils.id('MANAGER_ROLE')
    UPGRADER_ROLE = ethers.utils.id('UPGRADER_ROLE')
    PAUSER_ROLE = ethers.utils.id('PAUSER_ROLE')

    // SETUP TOKEN
    const USDT = await ethers.getContractFactory('Tether')
    usdtContract = await USDT.deploy()
    await usdtContract.deployed()

    // SETUP CUBE
    const Cube = await ethers.getContractFactory('cube')
    cubeContract = await upgrades.deployProxy(
      Cube,
      [usdtContract.address, ethers.utils.parseUnits("10.0", 6)],
      { initializer: 'initialize', kind: 'uups' }
    )
    await cubeContract.deployed()

    // SETUP INVESTMENT VEHICLE
  const Vehicle = await ethers.getContractFactory('InvestmentVehicle')
  vehicleContract = await upgrades.deployProxy(
    Vehicle,
    [usdtContract.address, 100],
    { initializer: 'initialize', kind: 'uups' }
  )
    await vehicleContract.deployed()



    // DEPOSIT REWARD AND INVESTMENTS
    await usdtContract.approve(vehicleContract.address, ethers.utils.parseUnits('2000.0', 6))
    expect(await usdtContract.allowance(owner.address, vehicleContract.address)).to.equal(ethers.utils.parseUnits('2000.0', 6));
    await expect(() => vehicleContract.depositReward(owner.address, ethers.utils.parseUnits('250.0', 6))).to.changeTokenBalance(usdtContract, vehicleContract, ethers.utils.parseUnits('250.0', 6))
    expect(await vehicleContract.rewardPool()).to.be.equal(ethers.utils.parseUnits('225.0', 6))
    vehicleContract.grantRole(ethers.utils.id('MANAGER_ROLE'), cubeContract.address)



    //USER 1 BUYS 1 SHARE
    await usdtContract.transfer(addr1.address, ethers.utils.parseUnits('2000.0', 6))
    await usdtContract.connect(addr1).approve(cubeContract.address, BASIC_APPROVAL_AMOUNT_USDT)
    expect(await usdtContract.allowance(addr1.address, cubeContract.address)).to.equal(BASIC_APPROVAL_AMOUNT_USDT);
    await expect(() => cubeContract.connect(addr1).buyShares(1)).to.changeTokenBalance(usdtContract, cubeContract, ethers.utils.parseUnits("10.0", 6))
    expect(await cubeContract.shareHolderCount()).to.be.equal(1)

    //USER 2 BUYS 5 SHARES
    await usdtContract.transfer(addr2.address, ethers.utils.parseUnits('2000.0', 6))
    await usdtContract.connect(addr2).approve(cubeContract.address, BASIC_APPROVAL_AMOUNT_USDT)
    expect(await usdtContract.allowance(addr2.address, cubeContract.address)).to.equal(BASIC_APPROVAL_AMOUNT_USDT);
    await expect(() => cubeContract.connect(addr2).buyShares(5)).to.changeTokenBalance(usdtContract, cubeContract, ethers.utils.parseUnits("50.0", 6))
    expect(await cubeContract.shareHolderCount()).to.be.equal(2)
  })

  describe('Cube.setInvestmentTarget', () => {
    it('Should be set to 0x0 when initialized', async () => {
        expect(await cubeContract.targetVehicle()).to.be.equal(ZERO_ADDRESS)
        expect(await cubeContract.targetAmount()).to.be.equal(0)
    })
    it('Should be able to set new targetVehicle. Removing the old one', async () => {
        expect(await cubeContract.targetVehicle()).to.be.equal(ZERO_ADDRESS)
        expect(await cubeContract.targetAmount()).to.be.equal(0)
        expect(await cubeContract.setInvestmentTarget(vehicleContract.address, ethers.utils.parseUnits('5000.0',6)))
        expect(await cubeContract.targetVehicle()).to.be.equal(vehicleContract.address)
        expect(await cubeContract.targetAmount()).to.be.equal(ethers.utils.parseUnits('5000.0',6))

    })
    it('Should be trigger funding when adding vechicle with funding below current invested amount', async () => {
        expect(await vehicleContract.investmentPool()).to.be.equal(ethers.utils.parseUnits('0.0',6))
        expect(await cubeContract.investmentHeld()).to.be.equal(ethers.utils.parseUnits('60.0',6))
        expect(await cubeContract.setInvestmentTarget(vehicleContract.address, ethers.utils.parseUnits('20.0',6)))
        expect(await vehicleContract.investmentPool()).to.be.equal(ethers.utils.parseUnits('20.0',6))
        expect(await cubeContract.investmentHeld()).to.be.equal(ethers.utils.parseUnits('40.0',6))
    })
   })