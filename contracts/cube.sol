// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
/**
             _   _         _     ___ _
 ___ _ _ ___| |_| |___ ___| |_  |  _|_|___ ___ ___ ___ ___
|_ -| | |   | . | | . |  _| '_|_|  _| |   | .'|   |  _| -_|
|___|___|_|_|___|_|___|___|_,_|_|_| |_|_|_|__,|_|_|___|___|

*/

// Developed by Kenth Fagerlund (https://github.com/arkalon76)
// Inspired by the fantastic work by Dogu Deniz UGUR (https://github.com/DoguD)

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "./ISunblockInvestmentVehicle.sol";


contract cube is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    // ========= //
    //  STRUCTS  //
    // ========= //
    struct Shareholder {
        uint256 shares;
    }

    // ========== //
    //   EVENTS   //
    // ========== //
    event SharesIssued(address holder, uint256 sharesIssued);
    event CollectedReward(address collector, uint256 amount, address vehicle);
    event NewShareholder(address shareholder);
    event RewardIssued(address holderAddress, uint256 rewardShare);
    event RewardsDepleted(uint256 _holderno, uint256 rewardBalance);
    event TargetVehicleFunded(address targetVehicle, uint256 targetAmount);

    /**
      This will dictate what funding instrument it accepts and will distribute to investment vehicles.
      Side effect of this, is that it will not be able to fund vehicle with different instruments.
     */
    IERC20Upgradeable fundingInstrument;
    /**
    How much each share in this cube cost
     */
    uint256 public unitcost;
    /**
    Mapping to all shareholders and their current amount
     */
    EnumerableSetUpgradeable.AddressSet private holders;
    mapping(address => Shareholder) public shareholder;
    /**
    Total amount of shares issued by this cube
     */
    uint256 public sharesIssued;

    /**
    Total amount of investment that is held by the contract waiting to be invested
    in a investment vehicle
     */
    uint256 public investmentHeld;

    /**
    Total amount of rewards held by the contract. This is a lump sum of all rewards collected
    from all vehicles. For greater detail on stats, review the vehicles themself
     */
    uint256 public rewardsHeld;


    // ======= Investment Queue ======== //

    /**
    Current investment vehicle where funds are being accumulated
     */
    address public currentVehicle;
    uint256 public currentTargetAmount;

    /**
    Next investment vehicle that will replace the current when target amount has been
    reached for the current vehicle and fund been sent to it.
     */
    address public nextVehicle;
    uint256 public nextTargetAmount;


    function initialize(address _fundingInstrument, uint256 _unitcost)
        public
        initializer
    {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);

        fundingInstrument = IERC20Upgradeable(_fundingInstrument);
        unitcost = _unitcost;
    }

    function setInvestmentTarget(address _target, uint256 _amount)
        external
        onlyRole(GOVERNOR_ROLE)
    {
        if (currentVehicle == address(0)) {
            currentVehicle = _target;
            currentTargetAmount = _amount;
        } else {
            nextVehicle = _target;
            nextTargetAmount = _amount;
        }
    }

    function _tryFundingTarget() internal returns (bool) {
        address tv = currentVehicle;
        require(currentTargetAmount > 0, "Target amount is too damn low");
        if (tv != address(0) && investmentHeld >= currentTargetAmount) {
            if (
                fundingInstrument.allowance(address(this), tv) <= currentTargetAmount
            ) {
                fundingInstrument.safeApprove(tv, 1e18);
            }
            ISunblockInvestmentVehicle vehicleContract = ISunblockInvestmentVehicle(
                    tv
                );
            vehicleContract.depositInvestment(address(this), currentTargetAmount);
            emit TargetVehicleFunded(tv, currentTargetAmount);
            investmentHeld -= currentTargetAmount;
            currentVehicle = nextVehicle;
            nextVehicle = address(0);
            return true;
        } else {
            return false;
        }
    }

    function shareHolderCount() external view returns (uint256) {
        return EnumerableSetUpgradeable.length(holders);
    }

    function buyShares(uint256 _shareAmount)
        external
        nonReentrant
        whenNotPaused
    {
        require(_shareAmount >= 1, "Share amount must be 1 or more");
        // Transfer funds into the pool
        uint256 totalCost = unitcost.mul(_shareAmount);
        fundingInstrument.transferFrom(msg.sender, address(this), totalCost);
        // Issue shares to the signer.
        Shareholder storage sh = shareholder[msg.sender];
        sh.shares += _shareAmount;
        bool newHolder = EnumerableSetUpgradeable.add(holders, msg.sender);
        if (newHolder) {
            emit NewShareholder(msg.sender);
        }
        // Issue shares to the signer.
        sharesIssued += _shareAmount;
        investmentHeld += totalCost;

        //Emit events
        emit SharesIssued(msg.sender, _shareAmount);

        //Let's check if we reached the target amount for the current funding target
        _tryFundingTarget();
    }

    /**
  Will withdraw rewards from investment Vehicle. Note: The cube need to be managing that specific
  vehicle to be allow to make the withdrawal.
   */
    function collectRewards(address _vehicle, uint256 _amount)
        external
        onlyRole(MANAGER_ROLE)
        whenNotPaused
        nonReentrant
    {
        require(_amount > 0, "Amount must be over 0");
        ISunblockInvestmentVehicle vh = ISunblockInvestmentVehicle(_vehicle);
        vh.withdrawReward(address(this), _amount);
        rewardsHeld += _amount;
        emit CollectedReward(address(this), _amount, _vehicle);
    }

    /**
     *
     * @dev Will distribute the rewards to shareholder.
     * Note that the fee has been taken when rewards were deposited so the full sum
     * is distrubuted at this time
     */
    function distributeRewards()
        external
        onlyRole(MANAGER_ROLE)
        whenNotPaused
        nonReentrant
    {
        // How much reward for each share
        uint256 rewardPerShare = rewardsHeld / sharesIssued;

        // Check that we have rewards enough to distribute
        require(rewardsHeld > 0, "No rewards to distribute");

        // Loop though all shareholders so we can issue their share
        uint256 _holderno = EnumerableSetUpgradeable.length(holders);
        for (uint256 i = 0; i < _holderno; ++i) {
            // How many shares does the holder have?
            address holderAddr = EnumerableSetUpgradeable.at(holders, i);
            Shareholder memory holder = shareholder[holderAddr];

            // How much is his/her/their share
            uint256 rewardShare = rewardPerShare * holder.shares;
            fundingInstrument.safeTransfer(holderAddr, rewardShare);
            rewardsHeld -= rewardShare;
            emit RewardIssued(holderAddr, rewardShare);
        }
        emit RewardsDepleted(_holderno, rewardsHeld);
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
