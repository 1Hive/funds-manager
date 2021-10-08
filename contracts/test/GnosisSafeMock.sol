pragma solidity ^0.4.24;

import "../GnosisSafe.sol";

contract GnosisSafeMock is GnosisSafe {

    Operation public operationPassed;

    // This functionality has been copied from the Gnosis Safe Module execution function:
    // https://github.com/gnosis/safe-contracts/blob/main/contracts/base/ModuleManager.sol#L80
    function execTransactionFromModuleReturnData(address to, uint256 value, bytes memory data, Operation operation)
        public returns (bool success, bytes memory returnData)
    {
        operationPassed = operation;
        uint256 remainingGas = gasleft();
        assembly {
            success := call(remainingGas, to, value, add(data, 0x20), mload(data), 0, 0)

            // Load free memory location
            let ptr := mload(0x40)
            // We allocate memory for the return data by setting the free memory location to
            // current free memory location + data size + 32 bytes for data size value
            mstore(0x40, add(ptr, add(returndatasize(), 0x20)))
            // Store the size
            mstore(ptr, returndatasize())
            // Store the data
            returndatacopy(add(ptr, 0x20), 0, returndatasize())
            // Point the return data to the correct memory location
            returnData := ptr
        }
    }
}
