// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.9.0;

contract Verify {
  string storedData;

  function set(string memory x) internal {
    storedData = x;
  }

  function get() public view returns (string memory) {
    return storedData;
  }

  function executeSetIfSignatureMatch(
    uint8 v,
    bytes32 r,
    bytes32 s,
    address sender,
    uint256 deadline,
    string calldata x
  ) external {
    require(block.timestamp < deadline, "Signed transaction expired");

    uint chainId;
    assembly {
      chainId := chainid()
    }
    bytes32 eip712DomainHash = keccak256(
        abi.encode(
            keccak256(
                "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
            ),
            keccak256(bytes("SetTest")),
            keccak256(bytes("1")),
            chainId,
            address(this)
        )
    );

    bytes32 hashStruct = keccak256(
      abi.encode(
          keccak256("set(address sender,string x,uint deadline)"),
          sender,
          keccak256(abi.encodePacked(x)),
          deadline
        )
    );

    bytes32 hash = keccak256(abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct));
    address signer = ecrecover(hash, v, r, s);
    require(signer == sender, "MyFunction: invalid signature");
    require(signer != address(0), "ECDSA: invalid signature");

    set(x);
  }
}