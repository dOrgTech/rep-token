import { ethers, deployments, getNamedAccounts } from "hardhat";
import { BigNumber, Signer } from "ethers";
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
  });

  beforeEach(async () => {
    ({ Reputation: RepTokenDeployment } = await deployments.fixture());

    RepToken = (await ethers.getContractAt(
      RepTokenDeployment.abi,
      RepTokenDeployment.address,
      signers[0]
    )) as Reputation;
  });

  describe("constructor()", async () => {
    it("should successfully deploy contract and mint to token holders ", async () => {
      expect(RepToken.address).to.not.be.null;
      expect(tokenHolders.holders.length).to.be.greaterThan(0);

      for (const tokenHolder of tokenHolders.holders) {
        const balance = await RepToken.balanceOf(tokenHolder.address);
        expect(balance.toString()).to.be.deep.equal(tokenHolder.amount);
      }
    });
  });

  describe("mint()", () => {
    it("should mint tokens to user, executed by owner", async () => {
      const newHolder = accountsAddresses[3];
      const balance = 100000000;

      const initialBalance = await RepToken.balanceOf(newHolder);
      expect(initialBalance).to.be.deep.equal(BigNumber.from(0));

      const mintTx = await RepToken.mint(newHolder, balance);
      await mintTx.wait();

      const newBalance = await RepToken.balanceOf(newHolder);
      expect(newBalance).to.be.deep.equal(BigNumber.from(newBalance));
    });

    it("should revert transaction because is being called by someone that its not owner", async () => {
      const notOwner = signers[2];
      const ReputationToken = await ethers.getContractAt(
        RepTokenDeployment.abi,
        RepTokenDeployment.address,
        notOwner
      );
      await expect(
        ReputationToken.mint(await notOwner.getAddress(), 10000)
      ).to.be.rejectedWith(
        "VM Exception while processing transaction: revert Ownable: caller is not the owner"
      );
    });
  });

  describe("mintMultiple()", () => {
    it("should mint tokens to multiple users, executed by owner", async () => {
      const newHolder = accountsAddresses[3];
      const anotherHolder = accountsAddresses[4];
      const balance = 100000000;
      const initialNewHolderBalance = await RepToken.balanceOf(newHolder);
      const initialAnotherHolderBalance = await RepToken.balanceOf(newHolder);
      expect(initialNewHolderBalance).to.be.deep.equal(BigNumber.from(0));
      expect(initialAnotherHolderBalance).to.be.deep.equal(BigNumber.from(0));

      const mintTx = await RepToken.mintMultiple(
        [newHolder, anotherHolder],
        [balance, balance]
      );
      await mintTx.wait();

      const newBalanceOfNewHolder = await RepToken.balanceOf(newHolder);
      const newBalanceOfAnotherHolder = await RepToken.balanceOf(anotherHolder);
      expect(newBalanceOfNewHolder).to.be.deep.equal(BigNumber.from(balance));
      expect(newBalanceOfAnotherHolder).to.be.deep.equal(
        BigNumber.from(balance)
      );
    });

    it("should revert transaction because caller its not owner", async () => {
      const newHolder = accountsAddresses[3];
      const anotherHolder = accountsAddresses[4];
      const balance = 100000000;
      await expect(
        RepToken.mintMultiple([newHolder, anotherHolder], [balance])
      ).to.be.rejectedWith(
        "VM Exception while processing transaction: revert Token holders and amounts lengths must match"
      );
    });
  });

  describe("burnFrom()", () => {
    it("should burn tokens of user, executed by owner", async () => {
      const newHolder = accountsAddresses[3];
      const balance = 100000000;

      const mintTx = await RepToken.mint(newHolder, balance);
      await mintTx.wait();

      const newBalance = await RepToken.balanceOf(newHolder);
      expect(newBalance).to.be.deep.equal(BigNumber.from(balance));

      const burnTx = await RepToken.burnFrom(newHolder, balance);
      await burnTx.wait();

      const balanceAfterBurn = await RepToken.balanceOf(newHolder);
      expect(balanceAfterBurn).to.be.deep.equal(BigNumber.from(0));
    });

    it("should revert because caller its not owner", async () => {
      const ReputationToken = await ethers.getContractAt(
        RepTokenDeployment.abi,
        RepTokenDeployment.address,
        signers[5]
      );

      const newHolder = accountsAddresses[3];
      const balance = 100000000;

      const mintTx = await RepToken.mint(newHolder, balance);
      await mintTx.wait();

      const newBalance = await RepToken.balanceOf(newHolder);
      expect(newBalance).to.be.deep.equal(BigNumber.from(balance));

      await expect(
        ReputationToken.burnFrom(newHolder, balance)
      ).to.be.rejectedWith(
        "VM Exception while processing transaction: revert Ownable: caller is not the owner"
      );
    });
  });
});
