// require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("hardhat-deploy");
require("dotenv").config();

require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: process.env.MAINNET_RPC_URL
            }
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: [process.env.PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 3,
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
    // solidity: { compilers: [{ version: "0.8.19" }, { version: "0.4.19" }] }
    solidity: {
        compilers: [{version: "0.8.19"}, {version: "0.6.12"}]
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user1: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKET_API_KEY || "",
    },
    mocha: {
        timeout: 300000,
    },
};
