// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PetStorage {
    struct PetRecord {
        string cid;
        uint256 timestamp;
    }

    mapping(string => PetRecord) private records;
    event PetLogged(string indexed petId, string cid, uint256 timestamp);

    function logPetData(string calldata petId, string calldata cid, uint256 timestamp) external {
        records[petId] = PetRecord(cid, timestamp);
        emit PetLogged(petId, cid, timestamp);
    }

    function getPetData(string calldata petId) external view returns (string memory cid, uint256 timestamp) {
        PetRecord memory rec = records[petId];
        return (rec.cid, rec.timestamp);
    }
}
