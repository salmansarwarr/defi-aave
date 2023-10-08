const networkConfig = {
    31337: {
        name: "localhost",
        wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        daiToken: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        daiEthPriceFeed: "0x773616e4d11a78f511299002da57a0a94577f1f4",
        lendingPoopAddressProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {networkConfig, developmentChains}