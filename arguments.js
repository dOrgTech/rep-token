const ethers = require("ethers");

const migration = require("./config/dorg-rep-migration.json");
const tokenHolders = [];
const amounts = [];

for (const holder of migration.holders) {
  tokenHolders.push(holder.address);
  amounts.push(ethers.BigNumber.from(holder.amount))
}

module.exports = [
  tokenHolders,
  amounts
];
