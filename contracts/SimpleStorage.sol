// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract SimpleStorage {
  uint ipfsHash;

  function set(uint x) public {
    ipfsHash = x;
  }

  function get() public view returns (uint) {
    return ipfsHash;
  }
}
