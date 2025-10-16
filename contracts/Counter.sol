// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Counter
 * @dev A simple counter contract for testing parallel execution
 * @author Virtual Chain Sandbox Team
 */
contract Counter {
    uint256 private _count;
    uint256 private _lastIncrement;
    address private _owner;
    
    event Incremented(uint256 newCount, address indexed caller, uint256 timestamp);
    event Decremented(uint256 newCount, address indexed caller, uint256 timestamp);
    event Reset(uint256 newCount, address indexed caller, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == _owner, "Counter: caller is not the owner");
        _;
    }
    
    constructor() {
        _owner = msg.sender;
        _count = 0;
        _lastIncrement = block.timestamp;
    }
    
    /**
     * @dev Increment the counter by 1
     * This function is designed to be called frequently for parallel execution testing
     */
    function increment() external {
        _count++;
        _lastIncrement = block.timestamp;
        emit Incremented(_count, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Increment the counter by a specific amount
     * @param amount The amount to increment by
     */
    function incrementBy(uint256 amount) external {
        require(amount > 0, "Counter: amount must be greater than 0");
        _count += amount;
        _lastIncrement = block.timestamp;
        emit Incremented(_count, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Decrement the counter by 1
     */
    function decrement() external {
        require(_count > 0, "Counter: count cannot be negative");
        _count--;
        emit Decremented(_count, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Reset the counter to 0
     * Only the owner can reset the counter
     */
    function reset() external onlyOwner {
        _count = 0;
        emit Reset(_count, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get the current count
     * @return The current count value
     */
    function getCount() external view returns (uint256) {
        return _count;
    }
    
    /**
     * @dev Get the last increment timestamp
     * @return The timestamp of the last increment
     */
    function getLastIncrement() external view returns (uint256) {
        return _lastIncrement;
    }
    
    /**
     * @dev Get the owner address
     * @return The owner address
     */
    function getOwner() external view returns (address) {
        return _owner;
    }
    
    /**
     * @dev Batch increment function for parallel execution testing
     * @param iterations Number of iterations to increment
     */
    function batchIncrement(uint256 iterations) external {
        require(iterations > 0, "Counter: iterations must be greater than 0");
        require(iterations <= 100, "Counter: iterations cannot exceed 100");
        
        for (uint256 i = 0; i < iterations; i++) {
            _count++;
        }
        
        _lastIncrement = block.timestamp;
        emit Incremented(_count, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Gas-optimized increment for high-frequency calls
     * This function minimizes gas usage for parallel execution testing
     */
    function fastIncrement() external {
        assembly {
            let count := sload(0)
            sstore(0, add(count, 1))
            sstore(1, timestamp())
        }
        
        emit Incremented(_count, msg.sender, block.timestamp);
    }
}
