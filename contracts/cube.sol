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
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

contract cube is
  Initializable,
  PausableUpgradeable,
  AccessControlUpgradeable,
  UUPSUpgradeable {
  using SafeMath for uint256;

   bytes32 public constant PAUSER_ROLE = keccak256('PAUSER_ROLE');
  bytes32 public constant UPGRADER_ROLE = keccak256('UPGRADER_ROLE');
  bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');


  constructor() initializer {}

    function initialize() public initializer {
    __Pausable_init();
    __AccessControl_init();
    __UUPSUpgradeable_init();

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(PAUSER_ROLE, msg.sender);
    _grantRole(UPGRADER_ROLE, msg.sender);
    _grantRole(MANAGER_ROLE, msg.sender);

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