// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Reputation is ERC20Burnable, Ownable {
    constructor(address[] memory tokenHolders, uint256[] memory amounts)
        ERC20("dOrg", "dOrg")
    {
        mintMultiple(tokenHolders, amounts);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        super._mint(to, amount);
    }

    function mintMultiple(
        address[] memory tokenHolders,
        uint256[] memory amounts
    ) public onlyOwner {
        require(
            tokenHolders.length == amounts.length,
            "Token holders and amounts lengths must match"
        );

        for (uint256 i = 0; i < tokenHolders.length; i++) {
            mint(tokenHolders[i], amounts[i]);
        }
    }

    function burnFrom(address account, uint256 amount)
        public
        override
        onlyOwner
    {
        super._burn(account, amount);
    }
}
