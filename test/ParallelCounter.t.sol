// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ParallelCounter } from "../contracts/ParallelCounter.sol";
import { Test } from "forge-std/Test.sol";

/**
 * @title ParallelCounterTest
 * @dev Solidity tests for the ParallelCounter contract optimized for Arcology
 * @dev Tests parallel execution patterns and conflict-free operations
 */
contract ParallelCounterTest is Test {
    ParallelCounter public parallelCounter;
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        parallelCounter = new ParallelCounter();
    }
    
    function testInitialState() public {
        assertEq(parallelCounter.getCount(), 0);
        assertEq(parallelCounter.getTotalIncrements(), 0);
        assertEq(parallelCounter.getOwner(), owner);
        assertEq(parallelCounter.getLastIncrement(), block.timestamp);
    }
    
    function testIncrement() public {
        parallelCounter.increment();
        assertEq(parallelCounter.getCount(), 1);
        assertEq(parallelCounter.getTotalIncrements(), 1);
    }
    
    function testIncrementBy() public {
        parallelCounter.incrementBy(5);
        assertEq(parallelCounter.getCount(), 5);
        assertEq(parallelCounter.getTotalIncrements(), 5);
    }
    
    function testBatchIncrement() public {
        parallelCounter.batchIncrement(10);
        assertEq(parallelCounter.getCount(), 10);
        assertEq(parallelCounter.getTotalIncrements(), 10);
    }
    
    function testBatchIncrementMax() public {
        parallelCounter.batchIncrement(100);
        assertEq(parallelCounter.getCount(), 100);
        assertEq(parallelCounter.getTotalIncrements(), 100);
    }
    
    function testBatchIncrementExceedsMax() public {
        vm.expectRevert("ParallelCounter: iterations cannot exceed 100");
        parallelCounter.batchIncrement(101);
    }
    
    function testBatchIncrementZero() public {
        vm.expectRevert("ParallelCounter: iterations must be greater than 0");
        parallelCounter.batchIncrement(0);
    }
    
    function testIncrementByZero() public {
        vm.expectRevert("ParallelCounter: amount must be greater than 0");
        parallelCounter.incrementBy(0);
    }
    
    function testIncrementByTooLarge() public {
        vm.expectRevert("ParallelCounter: amount too large for parallel execution");
        parallelCounter.incrementBy(1001);
    }
    
    function testDecrement() public {
        parallelCounter.incrementBy(10);
        parallelCounter.decrement();
        assertEq(parallelCounter.getCount(), 9);
    }
    
    function testDecrementUnderflow() public {
        vm.expectRevert("ParallelCounter: count cannot be negative");
        parallelCounter.decrement();
    }
    
    function testReset() public {
        parallelCounter.incrementBy(10);
        parallelCounter.reset();
        assertEq(parallelCounter.getCount(), 0);
        assertEq(parallelCounter.getTotalIncrements(), 0);
    }
    
    function testResetOnlyOwner() public {
        parallelCounter.incrementBy(10);
        
        vm.prank(user1);
        vm.expectRevert("ParallelCounter: caller is not the owner");
        parallelCounter.reset();
    }
    
    function testFastIncrement() public {
        parallelCounter.fastIncrement();
        assertEq(parallelCounter.getCount(), 1);
        assertEq(parallelCounter.getTotalIncrements(), 1);
    }
    
    function testConcurrentIncrement() public {
        parallelCounter.concurrentIncrement();
        assertEq(parallelCounter.getCount(), 1);
        assertEq(parallelCounter.getTotalIncrements(), 1);
    }
    
    function testParallelIncrement() public {
        parallelCounter.parallelIncrement(1);
        assertEq(parallelCounter.getCount(), 1);
        assertEq(parallelCounter.getTotalIncrements(), 1);
    }
    
    // Tests for parallel execution scenarios
    function testMultipleUsersIncrement() public {
        vm.prank(user1);
        parallelCounter.increment();
        
        vm.prank(user2);
        parallelCounter.increment();
        
        vm.prank(user3);
        parallelCounter.increment();
        
        assertEq(parallelCounter.getCount(), 3);
        assertEq(parallelCounter.getTotalIncrements(), 3);
    }
    
    function testParallelBatchIncrements() public {
        vm.prank(user1);
        parallelCounter.batchIncrement(5);
        
        vm.prank(user2);
        parallelCounter.batchIncrement(10);
        
        vm.prank(user3);
        parallelCounter.batchIncrement(15);
        
        assertEq(parallelCounter.getCount(), 30);
        assertEq(parallelCounter.getTotalIncrements(), 30);
    }
    
    function testParallelIncrementBy() public {
        vm.prank(user1);
        parallelCounter.incrementBy(3);
        
        vm.prank(user2);
        parallelCounter.incrementBy(7);
        
        vm.prank(user3);
        parallelCounter.incrementBy(10);
        
        assertEq(parallelCounter.getCount(), 20);
        assertEq(parallelCounter.getTotalIncrements(), 20);
    }
    
    function testMixedParallelOperations() public {
        vm.prank(user1);
        parallelCounter.increment();
        
        vm.prank(user2);
        parallelCounter.incrementBy(2);
        
        vm.prank(user3);
        parallelCounter.batchIncrement(3);
        
        assertEq(parallelCounter.getCount(), 6);
        assertEq(parallelCounter.getTotalIncrements(), 6);
    }
    
    function testParallelGroupExecution() public {
        // Simulate parallel execution groups
        vm.prank(user1);
        parallelCounter.parallelIncrement(1);
        
        vm.prank(user2);
        parallelCounter.parallelIncrement(1);
        
        vm.prank(user3);
        parallelCounter.parallelIncrement(2);
        
        assertEq(parallelCounter.getCount(), 3);
        assertEq(parallelCounter.getTotalIncrements(), 3);
    }
    
    function testGasUsageIncrement() public {
        uint256 gasStart = gasleft();
        parallelCounter.increment();
        uint256 gasUsed = gasStart - gasleft();
        
        // Gas usage should be reasonable for parallel execution
        assertLt(gasUsed, 100000);
    }
    
    function testGasUsageFastIncrement() public {
        uint256 gasStart = gasleft();
        parallelCounter.fastIncrement();
        uint256 gasUsed = gasStart - gasleft();
        
        // Fast increment should use less gas
        assertLt(gasUsed, 100000);
    }
    
    function testGasUsageConcurrentIncrement() public {
        uint256 gasStart = gasleft();
        parallelCounter.concurrentIncrement();
        uint256 gasUsed = gasStart - gasleft();
        
        // Concurrent increment should be gas efficient
        assertLt(gasUsed, 100000);
    }
    
    function testEventsIncrement() public {
        // Test that increment works (events will be tested in integration)
        parallelCounter.increment();
        assertEq(parallelCounter.getCount(), 1);
    }
    
    function testEventsBatchIncrement() public {
        // Test that batch increment works
        parallelCounter.batchIncrement(5);
        assertEq(parallelCounter.getCount(), 5);
    }
    
    function testEventsParallelIncrement() public {
        // Test that parallel increment works
        parallelCounter.parallelIncrement(1);
        assertEq(parallelCounter.getCount(), 1);
    }
    
    // Fuzz tests for parallel execution
    function testFuzzIncrementBy(uint8 amount) public {
        vm.assume(amount > 0 && amount <= 1000);
        
        parallelCounter.incrementBy(amount);
        assertEq(parallelCounter.getCount(), amount);
        assertEq(parallelCounter.getTotalIncrements(), amount);
    }
    
    function testFuzzBatchIncrement(uint8 iterations) public {
        vm.assume(iterations > 0 && iterations <= 100);
        
        parallelCounter.batchIncrement(iterations);
        assertEq(parallelCounter.getCount(), iterations);
        assertEq(parallelCounter.getTotalIncrements(), iterations);
    }
    
    function testFuzzParallelIncrement(uint8 groupId) public {
        parallelCounter.parallelIncrement(groupId);
        assertEq(parallelCounter.getCount(), 1);
        assertEq(parallelCounter.getTotalIncrements(), 1);
    }
}
