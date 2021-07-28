import { DeployFunction } from "hardhat-deploy/types";
const { ethers, upgrades } = require("hardhat");

const args = require("../arguments");

const deployFunc: DeployFunction = async function({
  deployments,
  getNamedAccounts
}) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const res = await deploy("Reputation", {
    from: deployer,
    proxy: {
      owner: deployer,
      methodName: "initialize",
      proxyContract: "OpenZeppelinTransparentProxy"
    },
    args
  });
  console.log(res.address);
};

export default deployFunc;
deployFunc.tags = ["Reputation"];
