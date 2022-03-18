// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');



  describe('Cube.buyShares', function () {
    let cubeContract
    let usdtContract
    const BASIC_APPROVAL_AMOUNT_USDT = ethers.utils.parseUnits("200.0", 6)
    beforeEach(async function () {
      ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()

      MANAGER_ROLE = ethers.utils.id('MANAGER_ROLE')
      UPGRADER_ROLE = ethers.utils.id('UPGRADER_ROLE')
      PAUSER_ROLE = ethers.utils.id('PAUSER_ROLE')

      const USDT = await ethers.getContractFactory('Tether')
      usdtContract = await USDT.deploy()
      await usdtContract.deployed()

      // SETUP INVESTMENT VEHICLE
    const Vehicle = await ethers.getContractFactory("InvestmentVehicle");
    vehicleContract = await upgrades.deployProxy(Vehicle, [usdtContract.address, 100], {
      initializer: "initialize",
      kind: "uups",
    });
    await vehicleContract.deployed();

      // Get the ContractFactory and Signers here.
      const Cube = await ethers.getContractFactory('cube')
      cubeContract = await upgrades.deployProxy(
        Cube,
        [usdtContract.address, 10000000n],
        { initializer: 'initialize', kind: 'uups' }
      )
      await cubeContract.deployed()


      expect(await cubeContract.setInvestmentTarget(vehicleContract.address, ethers.utils.parseUnits("5000.0", 6)));

    });

    it('Should updates balance on deposit and update sharesIssued', async () => {
      expect(await cubeContract.currentTargetAmount()).to.be.equal(ethers.utils.parseUnits("5000.0", 6));
      await usdtContract.approve(cubeContract.address, BASIC_APPROVAL_AMOUNT_USDT)
      expect(await usdtContract.allowance(owner.address, cubeContract.address)).to.equal(BASIC_APPROVAL_AMOUNT_USDT);
      await expect(() => cubeContract.buyShares(10)).to.changeTokenBalance(usdtContract, cubeContract, ethers.utils.parseUnits("100.0", 6))
      expect(await cubeContract.sharesIssued()).to.be.equal(10)
    })

    it('Should emit SharesIssued event.', async () => {
        await usdtContract.approve(cubeContract.address, BASIC_APPROVAL_AMOUNT_USDT)
        expect(await usdtContract.allowance(owner.address, cubeContract.address)).to.equal(BASIC_APPROVAL_AMOUNT_USDT);
        expect(await cubeContract.buyShares(10)).to.emit(cubeContract, 'SharesIssued').withArgs(owner.address, 10)
    })

    it('Should update investmentHeld after shares successfully bought', async () => {
        await usdtContract.approve(cubeContract.address, BASIC_APPROVAL_AMOUNT_USDT)
        expect(await usdtContract.allowance(owner.address, cubeContract.address)).to.equal(BASIC_APPROVAL_AMOUNT_USDT);
        await expect(() => cubeContract.buyShares(10)).to.changeTokenBalance(usdtContract, cubeContract, ethers.utils.parseUnits("100.0", 6))
        expect(await cubeContract.investmentHeld()).to.be.equal(ethers.utils.parseUnits("100.0", 6))
    })

    it('Should revert if trying to buy 0 shares', async () => {
        await usdtContract.approve(cubeContract.address, BASIC_APPROVAL_AMOUNT_USDT)
        expect(await usdtContract.allowance(owner.address, cubeContract.address)).to.equal(BASIC_APPROVAL_AMOUNT_USDT);
        await expect(cubeContract.buyShares(0)).to.be.revertedWith('Share amount must be 1 or more')
        expect(await cubeContract.investmentHeld()).to.be.equal(ethers.utils.parseUnits("0.0", 6))
    })

    it('Should emit NewShareholder when its first purchase', async () => {
        await usdtContract.approve(cubeContract.address, BASIC_APPROVAL_AMOUNT_USDT)
        expect(await usdtContract.allowance(owner.address, cubeContract.address)).to.equal(BASIC_APPROVAL_AMOUNT_USDT);
        await expect(cubeContract.buyShares(10)).to.emit(cubeContract, 'NewShareholder').withArgs(owner.address)
        expect(await cubeContract.investmentHeld()).to.be.equal(ethers.utils.parseUnits("100.0", 6))
    })
    it('Should NOT emit NewShareholder when its second purchase', async () => {
        await usdtContract.approve(cubeContract.address, BASIC_APPROVAL_AMOUNT_USDT)
        expect(await usdtContract.allowance(owner.address, cubeContract.address)).to.equal(BASIC_APPROVAL_AMOUNT_USDT);
        await expect(cubeContract.buyShares(10)).to.emit(cubeContract, 'NewShareholder').withArgs(owner.address)
        await expect(cubeContract.buyShares(10)).to.not.emit(cubeContract, 'NewShareholder').withArgs(owner.address)
        expect(await cubeContract.investmentHeld()).to.be.equal(ethers.utils.parseUnits("200.0", 6))
    })

})