// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract Verify is EIP712 {
  constructor() EIP712("test","1.0") {}
  string public storedData;

  function set(string memory msg) internal {
    storedData = msg;
  }

  function get() public view returns (string memory) {
    return storedData;
  }

  function executeSetIfSignatureMatch(
    address sender,
    uint256 deadline,
    string calldata msg,
    bytes memory signature
  ) external {
    require(block.timestamp < deadline, "Signed transaction expired");

    bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
      keccak256("set(address sender,string msg,uint deadline)"),
      sender,
      keccak256(abi.encodePacked(msg)),
      deadline
    )));

    address signer = ECDSA.recover(digest, signature);
    require(signer == sender, "MyFunction: invalid signature");
    require(signer != address(0), "ECDSA: invalid signature");

    set(msg);
  }
}