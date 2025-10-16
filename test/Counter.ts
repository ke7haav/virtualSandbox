import { expect } from "chai";
import { ethers } from "hardhat";
import { Counter } from "../typechain-types";

describe("Counter", function () {
  let counter: Counter;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const CounterFactory = await ethers.getContractFactory("Counter");
    counter = await CounterFactory.deploy();
    await counter.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await counter.getOwner()).to.equal(owner.address);
    });

    it("Should initialize with count 0", async function () {
      expect(await counter.getCount()).to.equal(0);
    });
  });

  describe("Increment", function () {
    it("Should increment count by 1", async function () {
      await counter.increment();
      expect(await counter.getCount()).to.equal(1);
    });

    it("Should increment count by specific amount", async function () {
      await counter.incrementBy(5);
      expect(await counter.getCount()).to.equal(5);
    });

    it("Should emit Incremented event", async function () {
      await expect(counter.increment())
        .to.emit(counter, "Incremented")
        .withArgs(1, owner.address, await counter.getLastIncrement());
    });

    it("Should reject increment by 0", async function () {
      await expect(counter.incrementBy(0))
        .to.be.revertedWith("Counter: amount must be greater than 0");
    });
  });

  describe("Decrement", function () {
    it("Should decrement count by 1", async function () {
      await counter.incrementBy(10);
      await counter.decrement();
      expect(await counter.getCount()).to.equal(9);
    });

    it("Should reject decrement when count is 0", async function () {
      await expect(counter.decrement())
        .to.be.revertedWith("Counter: count cannot be negative");
    });
  });

  describe("Reset", function () {
    it("Should reset count to 0", async function () {
      await counter.incrementBy(10);
      await counter.reset();
      expect(await counter.getCount()).to.equal(0);
    });

    it("Should only allow owner to reset", async function () {
      await counter.incrementBy(10);
      await expect(counter.connect(user1).reset())
        .to.be.revertedWith("Counter: caller is not the owner");
    });
  });

  describe("Batch Operations", function () {
    it("Should batch increment", async function () {
      await counter.batchIncrement(5);
      expect(await counter.getCount()).to.equal(5);
    });

    it("Should reject batch increment with 0 iterations", async function () {
      await expect(counter.batchIncrement(0))
        .to.be.revertedWith("Counter: iterations must be greater than 0");
    });

    it("Should reject batch increment exceeding max", async function () {
      await expect(counter.batchIncrement(101))
        .to.be.revertedWith("Counter: iterations cannot exceed 100");
    });
  });

  describe("Fast Increment", function () {
    it("Should fast increment", async function () {
      await counter.fastIncrement();
      expect(await counter.getCount()).to.equal(1);
    });
  });

  describe("Multiple Users", function () {
    it("Should allow multiple users to increment", async function () {
      await counter.connect(user1).increment();
      await counter.connect(user2).increment();
      expect(await counter.getCount()).to.equal(2);
    });
  });

  describe("Gas Usage", function () {
    it("Should use reasonable gas for increment", async function () {
      const tx = await counter.increment();
      const receipt = await tx.wait();
      expect(receipt?.gasUsed).to.be.lt(50000);
    });

    it("Should use reasonable gas for fast increment", async function () {
      const tx = await counter.fastIncrement();
      const receipt = await tx.wait();
      expect(receipt?.gasUsed).to.be.lt(30000);
    });
  });

  describe("Parallel Execution Simulation", function () {
    it("Should handle concurrent increments", async function () {
      // Simulate parallel execution by sending multiple transactions
      const promises = [
        counter.connect(user1).increment(),
        counter.connect(user2).increment(),
        counter.connect(user1).increment(),
        counter.connect(user2).increment(),
      ];

      await Promise.all(promises);
      expect(await counter.getCount()).to.equal(4);
    });

    it("Should handle mixed operations", async function () {
      const promises = [
        counter.connect(user1).increment(),
        counter.connect(user2).incrementBy(2),
        counter.connect(user1).fastIncrement(),
        counter.connect(user2).batchIncrement(3),
      ];

      await Promise.all(promises);
      expect(await counter.getCount()).to.equal(7);
    });
  });
});
