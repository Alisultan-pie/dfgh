require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",           // match the pragma in PetStorage.sol
  networks: {
    amoy: {
      url: process.env.PROVIDER_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
