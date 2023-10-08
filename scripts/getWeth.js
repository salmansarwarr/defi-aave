const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const AMOUNT = ethers.parseEther("0.02");

const getWeth = async () => {
    const signer = await ethers.provider.getSigner();
    const chainId = network.config.chainId;

    const iWeth = await ethers.getContractAt(
        "IWeth",
        networkConfig[chainId].wethToken,
        signer
    );
    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1);
    const wethBalance = await iWeth.balanceOf(signer);
    console.log(`Got ${wethBalance.toString()} WETH`);
};

module.exports = { getWeth, AMOUNT };
