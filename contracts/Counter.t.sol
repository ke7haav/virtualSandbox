// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Counter} from "./Counter.sol";

/**
 * @title CounterTest
 * @dev Solidity tests for the Counter contract
 * @author Virtual Chain Sandbox Team
 */
contract CounterTest is Test {
    Counter public counter;
    address public owner;
    address public user1;
    address public user2;
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        counter = new Counter();
    }
    
    function testInitialState() public {
        assertEq(counter.getCount(), 0);
        assertEq(counter.getOwner(), owner);
        assertEq(counter.getLastIncrement(), block.timestamp);
    }
    
    function testIncrement() public {
        counter.increment();
        assertEq(counter.getCount(), 1);
    }
    
    function testIncrementBy() public {
        counter.incrementBy(5);
        assertEq(counter.getCount(), 5);
    }
    
    function testDecrement() public {
        counter.incrementBy(10);
        counter.decrement();
        assertEq(counter.getCount(), 9);
    }
    
    function testDecrementUnderflow() public {
        vm.expectRevert("Counter: count cannot be negative");
        counter.decrement();
    }
    
    function testReset() public {
        counter.incrementBy(10);
        counter.reset();
        assertEq(counter.getCount(), 0);
    }
    
    function testResetOnlyOwner() public {
        counter.incrementBy(10);
        
        vm.prank(user1);
        vm.expectRevert("Counter: caller is not the owner");
        counter.reset();
    }
    
    function testBatchIncrement() public {
        counter.batchIncrement(5);
        assertEq(counter.getCount(), 5);
    }
    
    function testBatchIncrementMax() public {
        counter.batchIncrement(100);
        assertEq(counter.getCount(), 100);
    }
    
    function testBatchIncrementExceedsMax() public {
        vm.expectRevert("Counter: iterations cannot exceed 100");
        counter.batchIncrement(101);
    }
    
    function testFastIncrement() public {
        counter.fastIncrement();
        assertEq(counter.getCount(), 1);
    }
    
    function testMultipleUsers() public {
        vm.prank(user1);
        counter.increment();
        
        vm.prank(user2);
        counter.increment();
        
        assertEq(counter.getCount(), 2);
    }
    
    function testParallelIncrements() public {
        // Simulate parallel execution by multiple users
        vm.prank(user1);
        counter.increment();
        
        vm.prank(user2);
        counter.increment();
        
        vm.prank(user1);
        counter.increment();
        
        assertEq(counter.getCount(), 3);
    }
    
    function testGasUsage() public {
        uint256 gasStart = gasleft();
        counter.increment();
        uint256 gasUsed = gasStart - gasleft();
        
        // Gas usage should be reasonable (less than 50k gas)
        assertLt(gasUsed, 50000);
    }
    
    function testEvents() public {
        vm.expectEmit(true, true, true, true);
        emit Incremented(1, address(this), block.timestamp);
        counter.increment();
    }
    
    function testIncrementByZero() public {
        vm.expectRevert("Counter: amount must be greater than 0");
        counter.incrementBy(0);
    }
    
    function testBatchIncrementZero() public {
        vm.expectRevert("Counter: iterations must be greater than 0");
        counter.batchIncrement(0);
    }
}
