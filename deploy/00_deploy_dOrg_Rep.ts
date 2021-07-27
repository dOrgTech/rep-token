import { DeployFunction } from "hardhat-deploy/types";
const { ethers, upgrades } = require("hardhat");

const args = require("../arguments");

const deployFunc: DeployFunction = async function({
  deployments,
  getNamedAccounts
}) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const res = await upgrades.deployProxy("Reputation", {
    from: deployer,
    args
  });
  console.log(res.address);
};

export default deployFunc;
deployFunc.tags = ["Reputation"];
