require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",           // match the pragma in PetStorage.sol
  networks: {
    amoy: {
      url: process.env.PROVIDER_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80002,
      // You can set a custom gas limit if you encounter errors:
      // gas: 6000000
    }
  }
};
