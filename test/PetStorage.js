const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PetStorage", function () {
  let PetStorage, petStorage, owner;

  beforeEach(async function () {
    PetStorage = await ethers.getContractFactory("PetStorage");
    [owner] = await ethers.getSigners();
    petStorage = await PetStorage.deploy();
    await petStorage.deployed();
  });

  it("should log and retrieve pet data", async function () {
    const petId = "pet123";
    const cid = "bafy...cid";
    const timestamp = Math.floor(Date.now() / 1000);
    await expect(petStorage.logPetData(petId, cid, timestamp))
      .to.emit(petStorage, "PetLogged")
      .withArgs(petId, cid, timestamp);
    const [storedCid, storedTimestamp] = await petStorage.getPetData(petId);
    expect(storedCid).to.equal(cid);
    expect(storedTimestamp).to.equal(timestamp);
  });

  it("should overwrite pet data for the same petId", async function () {
    const petId = "pet123";
    const cid1 = "cid1";
    const ts1 = 1111;
    const cid2 = "cid2";
    const ts2 = 2222;
    await petStorage.logPetData(petId, cid1, ts1);
    await petStorage.logPetData(petId, cid2, ts2);
    const [storedCid, storedTimestamp] = await petStorage.getPetData(petId);
    expect(storedCid).to.equal(cid2);
    expect(storedTimestamp).to.equal(ts2);
  });

  it("should return empty values for unknown petId", async function () {
    const [cid, timestamp] = await petStorage.getPetData("unknown");
    expect(cid).to.equal("");
    expect(timestamp).to.equal(0);
  });
}); 
