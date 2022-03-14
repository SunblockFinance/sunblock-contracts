// SPDX-License-Identifier: MIT
/**
             _   _         _     ___ _
 ___ _ _ ___| |_| |___ ___| |_  |  _|_|___ ___ ___ ___ ___
|_ -| | |   | . | | . |  _| '_|_|  _| |   | .'|   |  _| -_|
|___|___|_|_|___|_|___|___|_,_|_|_| |_|_|_|__,|_|_|___|___|

*/

// Developed by Kenth Fagerlund (https://github.com/arkalon76)
// Inspired by the fantastic work by Dogu Deniz UGUR (https://github.com/DoguD)
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';

contract cube is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeMathUpgradeable for uint256;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    // ========== //
    //   EVENTS   //
    // ========== //
    event SharesIssued(address holder, uint256 sharesIssued);

    /**
      This will dictate what funding instrument it accepts and will distribute to investment vehicles.
      Side effect of this, is that it will not be able to fund vehicle with different instruments.
     */
    IERC20 fundingInstrument;
    /**
    How much each share in this cube cost
     */
    uint256 unitcost;
    /**
    Mapping to all shareholders and their current amount
     */
    mapping(address => uint256) public shareholding;
    /**
    Total amount of shares issued by this cube
     */
    uint256 public sharesIssued;

    /**
    Total amount of investment that is held by the contract waiting to be invested
    in a investment vehicle
     */
    uint256 public investmentHeld;

  //  constructor() initializer {}

    function initialize(address _fundingInstrument, uint256 _unitcost) public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);

        fundingInstrument = IERC20(_fundingInstrument);
        unitcost = _unitcost;

    }

    // Queue: Targets
    // Target: amount, address

    function appendInvestmentTarget(address _target, uint256 _amount) external {

    }
    function removeInvestmentTarget(address _target) external {

    }
    function isNextTargetReached() internal {

    }

    function buyShares(uint256 _shareAmount) external nonReentrant {
    require(_shareAmount > 0, 'Share amount must be 1 or more');
    // Transfer funds into the pool
    uint256 totalCost = unitcost.mul(_shareAmount);
    bool success = fundingInstrument.transferFrom(
      msg.sender,
      address(this),
      totalCost
    );
    require(success, 'Failed to transfer');
    // Issue shares to the signer.
    shareholding[msg.sender] = _shareAmount;
    sharesIssued += _shareAmount;
    investmentHeld += totalCost;

    //Emit events
    emit SharesIssued(msg.sender, _shareAmount);
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
