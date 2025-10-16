import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Counter Module
 * Deploys the Counter contract for testing
 */
export default buildModule("CounterModule", (m) => {
  const counter = m.contract("Counter");

  // Initialize the counter with some test data
  m.call(counter, "incrementBy", [5]);

  return { counter };
});
