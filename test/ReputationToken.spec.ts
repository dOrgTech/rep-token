import { ethers, deployments, getNamedAccounts } from "hardhat";
import { Signer } from "ethers";
import { Deployment } from "hardhat-deploy/types";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";

import { Reputation } from "../typechain/Reputation";
import tokenHolders from "../config/dorg-rep-migration.json";

use(chaiAsPromised);

describe("dOrg Reputation Token", () => {
  let deployer: string;
  let signers: Signer[];
  let RepToken: Reputation;
  let RepTokenDeployment: Deployment;
  let accountsAddresses: string[];

  before(async () => {
    const namedAccounts = await getNamedAccounts();
    deployer = namedAccounts.deployer;
    signers = await ethers.getSigners();

    accountsAddresses = await Promise.all(
      signers.map((signer: Signer) => {
        return signer.getAddress();
      })
    );

    ({ Reputation: RepTokenDeployment } = await deployments.fixture());

    RepToken = (await ethers.getContractAt(
      RepTokenDeployment.abi,
      RepTokenDeployment.address,
      signers[0]
    )) as Reputation;
  });

  it("should successfully deploy contract and mint to token holders", async function() {
    expect(RepToken.address).to.not.be.null;
    expect(tokenHolders.holders.length).to.be.greaterThan(0);

    for (const tokenHolder of tokenHolders.holders) {
      const balance = await RepToken.balanceOf(tokenHolder.address);
      expect(balance.toString()).to.be.deep.equal(tokenHolder.amount);
    }
  });
});
