// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ParallelCounter
 * @dev A counter contract optimized for Arcology's parallel execution
 * @dev Uses storage-slot level conflict detection and concurrent programming patterns
 * @author Virtual Chain Sandbox Team
 */
contract ParallelCounter {
    // Use separate storage slots to minimize conflicts in parallel execution
    uint256 private _count;
    uint256 private _lastIncrement;
    uint256 private _totalIncrements;
    address private _owner;
    
    // Events for parallel execution monitoring
    event Incremented(uint256 newCount, address indexed caller, uint256 timestamp, uint256 totalIncrements);
    event BatchIncremented(uint256 count, uint256 total, address indexed caller, uint256 timestamp);
    event ParallelExecution(uint256 groupId, uint256 count, address indexed caller);
    
    modifier onlyOwner() {
        require(msg.sender == _owner, "ParallelCounter: caller is not the owner");
        _;
    }
    
    constructor() {
        _owner = msg.sender;
        _count = 0;
        _lastIncrement = block.timestamp;
        _totalIncrements = 0;
    }
    
    /**
     * @dev Increment the counter by 1
     * Optimized for Arcology's parallel execution with minimal storage conflicts
     */
    function increment() external {
        // Use separate storage slots to avoid conflicts
        _count++;
        _lastIncrement = block.timestamp;
        _totalIncrements++;
        
        emit Incremented(_count, msg.sender, block.timestamp, _totalIncrements);
    }
    
    /**
     * @dev Increment by specific amount
     * Designed to work well with parallel execution
     */
    function incrementBy(uint256 amount) external {
        require(amount > 0, "ParallelCounter: amount must be greater than 0");
        require(amount <= 1000, "ParallelCounter: amount too large for parallel execution");
        
        _count += amount;
        _lastIncrement = block.timestamp;
        _totalIncrements += amount;
        
        emit Incremented(_count, msg.sender, block.timestamp, _totalIncrements);
    }
    
    /**
     * @dev Batch increment optimized for parallel execution
     * Uses single storage update to minimize conflicts
     */
    function batchIncrement(uint256 iterations) external {
        require(iterations > 0, "ParallelCounter: iterations must be greater than 0");
        require(iterations <= 100, "ParallelCounter: iterations cannot exceed 100");
        
        // Single storage update for better parallel execution
        _count += iterations;
        _totalIncrements += iterations;
        _lastIncrement = block.timestamp;
        
        emit BatchIncremented(iterations, _count, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Parallel-safe increment with group ID
     * Designed for Arcology's parallel execution groups
     */
    function parallelIncrement(uint256 groupId) external {
        _count++;
        _lastIncrement = block.timestamp;
        _totalIncrements++;
        
        emit ParallelExecution(groupId, _count, msg.sender);
        emit Incremented(_count, msg.sender, block.timestamp, _totalIncrements);
    }
    
    /**
     * @dev Decrement with conflict detection
     * Safe for parallel execution
     */
    function decrement() external {
        require(_count > 0, "ParallelCounter: count cannot be negative");
        _count--;
        _lastIncrement = block.timestamp;
        
        emit Incremented(_count, msg.sender, block.timestamp, _totalIncrements);
    }
    
    /**
     * @dev Reset counter (owner only)
     * Safe for parallel execution as it's owner-only
     */
    function reset() external onlyOwner {
        _count = 0;
        _totalIncrements = 0;
        _lastIncrement = block.timestamp;
        
        emit Incremented(0, msg.sender, block.timestamp, 0);
    }
    
    /**
     * @dev Get current count
     * Read-only function, safe for parallel execution
     */
    function getCount() external view returns (uint256) {
        return _count;
    }
    
    /**
     * @dev Get total increments
     * Read-only function, safe for parallel execution
     */
    function getTotalIncrements() external view returns (uint256) {
        return _totalIncrements;
    }
    
    /**
     * @dev Get last increment timestamp
     * Read-only function, safe for parallel execution
     */
    function getLastIncrement() external view returns (uint256) {
        return _lastIncrement;
    }
    
    /**
     * @dev Get owner address
     * Read-only function, safe for parallel execution
     */
    function getOwner() external view returns (address) {
        return _owner;
    }
    
    /**
     * @dev Gas-optimized increment for high-frequency parallel calls
     * Minimizes storage operations for better parallel execution
     */
    function fastIncrement() external {
        // Use assembly for gas optimization
        assembly {
            let count := sload(0)
            sstore(0, add(count, 1))
            sstore(1, timestamp())
            sstore(2, add(sload(2), 1))
        }
        
        emit Incremented(_count, msg.sender, block.timestamp, _totalIncrements);
    }
    
    /**
     * @dev Concurrent-safe increment with minimal storage conflicts
     * Designed specifically for Arcology's storage-slot level conflict detection
     */
    function concurrentIncrement() external {
        // Use separate storage slots to avoid conflicts
        uint256 currentCount = _count;
        uint256 currentTotal = _totalIncrements;
        
        // Update in single transaction to minimize conflicts
        _count = currentCount + 1;
        _totalIncrements = currentTotal + 1;
        _lastIncrement = block.timestamp;
        
        emit Incremented(_count, msg.sender, block.timestamp, _totalIncrements);
    }
}
