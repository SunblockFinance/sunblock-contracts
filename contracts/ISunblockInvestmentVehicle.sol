// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/// @title ISunblockInvestmentVehicle
/// @author Kenth Fagerlund
/// @dev Interface to Sunblock Investment Vehicles.
interface ISunblockInvestmentVehicle {
    /// @notice Allows for managers of the vehicle to deposit investment funds
    /// @dev Token to fund the contract is dictated by the contract itself.
    /// @param invPool address from where funds are deposited.
    /// @param _amount wei amount of supported token to deposit.
    function depositInvestment(address invPool, uint256 _amount) external;

    /// @notice Allows for managers of this vehicle to withdraw investment funds
    /// @dev funds withdrawn is always in the currency of the contract when it was initialized
    /// @param receiver address to where the funds should be sent
    /// @param amount wei amount of supported token to withdraw to receiver
    function withdrawInvestment(address receiver, uint256 amount) external;
    function depositReward(address _rewardPool, uint256 _amount) external;
    function withdrawReward(address receiver, uint256 _amount) external;
    function withdrawManagerFee(address receiver, uint256 _amount) external;
}