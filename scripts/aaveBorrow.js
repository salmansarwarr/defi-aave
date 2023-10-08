const { getWeth, AMOUNT } = require("./getWeth");
const { ethers, network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

const main = async () => {
    await getWeth();

    const chainId = network.config.chainId;

    //Get Lending Pool Address
    const signer = await ethers.provider.getSigner();
    const lendingPool = await getLendingPool(signer, chainId);
    console.log(`lendingPool address ${lendingPool.target}`);

    //Approve AAVE to deposit
    const wethTokenAddress = networkConfig[chainId].wethToken;
    await approveErc20(wethTokenAddress, lendingPool.target, AMOUNT, signer);

    //Deposit
    console.log("Depositing...");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, signer, 0);
    console.log("Deposited!");

    //User Account Data
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        signer
    );

    //Get DAI price in ETH (since we want to borrow DAI)
    const daiPrice = await getDaiPrice(chainId);

    //Get available DAI to borrow (95% of it)
    const amountDaiToBorrow =
        availableBorrowsETH.toString() * 0.95 * (1 / Number(daiPrice));
    console.log(`You can borrow ${amountDaiToBorrow} DAI`);
    const amountDaiToBorrowWei = ethers.parseEther(
        amountDaiToBorrow.toString()
    );

    // Borrow
    const daiTokenAddress = networkConfig[chainId].daiToken;
    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, signer);

    // User Account Data (after borrowing)
    await getBorrowUserData(lendingPool, signer);

    // Repay
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, signer);

    // User Account Data (after Repaying)
    await getBorrowUserData(lendingPool, signer);
};

const repay = async (amount, daiAddress, lendingPool, account) => {
    await approveErc20(daiAddress, lendingPool.target, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 2, account);
    await repayTx.wait(1);
    console.log("Repayed!");
}

const borrowDai = async (daiAddress, lendingPool, amount, account) => {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amount,
        2,
        0,
        account
    );
    await borrowTx.wait(1);
    console.log("You've borrowed");
};

const getDaiPrice = async (chainId) => {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[chainId].daiEthPriceFeed
    );
    const price = (await daiEthPriceFeed.latestRoundData())[1];
    console.log(`The DAI/ETH price is ${price.toString()}`);
    return price;
};

const getBorrowUserData = async (lendingPool, account) => {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`);
    return { availableBorrowsETH, totalDebtETH };
};

const getLendingPool = async (account, chainId) => {
    const lendingPoopAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[chainId].lendingPoopAddressProvider,
        account
    );
    const lendingPoolAddress =
        await lendingPoopAddressProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    );
    return lendingPool;
};

const approveErc20 = async (
    contractAddress,
    spenderAddress,
    amountToSpend,
    account
) => {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        contractAddress,
        account
    );
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("Approved!");
};

main()
    .then(() => process.exit(2))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
