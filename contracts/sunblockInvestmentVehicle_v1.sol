// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import './ISunblockInvestmentVehicle.sol';

/// @custom:security-contact security@sunblock.finance
contract InvestmentVehicle is
  Initializable,
  PausableUpgradeable,
  AccessControlUpgradeable,
  UUPSUpgradeable,
  ISunblockInvestmentVehicle
{
  bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');
  bytes32 public constant UPGRADER_ROLE = keccak256('UPGRADER_ROLE');
  bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');

  bytes32 public vehicleName;

  uint256 public managementFee; // Fee taken from the reward prior to distribution. No fee for investment pool. EVER.
  uint256 public investmentPool; // Current stored investment in the pool
  uint256 public rewardPool; // Current stored rewards in the pool
  uint256 public feePool; // This pool collects the fees owed to the manager of the investment vehicle
  IERC20 public paymentInstrument; // Token used to be used for investment and reward. This will be later bridged and swapped to vehicle token


  // ========= EVENTS =========== //
  event InvestmentDeposited(address indexed from, address indexed by, uint256 amount);
  event InvestmentWithdrawn(address indexed to, address indexed by, uint256 amount);
  event RewardDeposited(address indexed from, address indexed by, uint256 amount);
  event RewardWithdrawn(address indexed to, address indexed by, uint256 amount);
  event FeeWithdrawn(address indexed to, address indexed by, uint256 amount);
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() initializer {}

  function initialize(bytes32 _name, address instrument, uint256 fee) public initializer {
    __Pausable_init();
    __AccessControl_init();
    __UUPSUpgradeable_init();

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(PAUSER_ROLE, msg.sender);
    _grantRole(UPGRADER_ROLE, msg.sender);
    _grantRole(MANAGER_ROLE, msg.sender);

    paymentInstrument = IERC20(instrument);
    managementFee = fee;
    vehicleName = _name;
  }


  function depositInvestment(address invPool, uint256 _amount) external  onlyRole(MANAGER_ROLE) whenNotPaused  {
    paymentInstrument.transferFrom(invPool, address(this), _amount);
    investmentPool += _amount;
    emit InvestmentDeposited(invPool, msg.sender, _amount);
  }
  function withdrawInvestment(address receiver, uint256 amount) external onlyRole(MANAGER_ROLE) whenNotPaused  {
    require(investmentPool >= amount,'Not enough balance in investment pool for withdrawal');
    paymentInstrument.transfer(receiver, amount);
    investmentPool -= amount;
    emit InvestmentWithdrawn(receiver, msg.sender, amount);
  }
  function depositReward(address _rewardPool, uint256 _amount) external onlyRole(MANAGER_ROLE) whenNotPaused  {
    require(_amount > 0, 'Amount must be over 0');
    uint256 rewardAfterFee = _extractFee(_amount);
    paymentInstrument.transferFrom(_rewardPool, address(this), _amount);
    rewardPool += rewardAfterFee;
    emit RewardDeposited(_rewardPool, msg.sender, _amount);
  }
  function withdrawReward(address receiver, uint256 _amount) external onlyRole(MANAGER_ROLE) whenNotPaused {
   require(rewardPool >= _amount, "Not enough balance in reward pool for withdrawal");
    paymentInstrument.transfer(receiver, _amount);
    rewardPool -= _amount;
    emit RewardWithdrawn(receiver, msg.sender, _amount);
  }
  function withdrawManagerFee(address receiver, uint256 _amount) external onlyRole(MANAGER_ROLE) whenNotPaused{
    require(feePool >= _amount, "Not enough balance in fee pool for withdrawal");
    paymentInstrument.transfer(receiver, _amount);
    feePool -= _amount;
    emit FeeWithdrawn(receiver, msg.sender, _amount);
  }
  function _extractFee(uint256 _amount) internal returns(uint256) {
    uint256 rewardAfterFee = (_amount * (1000 - managementFee)) / 1000;
    uint256 managerfee = _amount - rewardAfterFee;
    feePool += managerfee;
    return rewardAfterFee;
  }

  function pause() public onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() public onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  function _authorizeUpgrade(address newImplementation)
    internal
    override
    onlyRole(UPGRADER_ROLE)
  {}
}
