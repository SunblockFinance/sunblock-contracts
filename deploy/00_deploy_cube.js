// Copyright 2022 Kenth Fagerlund.
// SPDX-License-Identifier: MIT
// deploy/00_deploy_cube.js
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    await deploy('cube', {
      from: deployer,
      args: ['Hello'],
      log: true,
    });
  };
  module.exports.tags = ['Cube'];