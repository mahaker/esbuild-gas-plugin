import { assertEquals, assertRejects } from "https://deno.land/std@0.207.0/testing/asserts.ts";
import { generateGasEntryPoints } from "../lib.js"; // Corrected path

Deno.test("generateGasEntryPoints should correctly parse functions and their JSDoc comments", async () => {
  const expectedOutput = `/**
 * This is an arrow function.
 * @param {string} param1 - A parameter.
 * @returns {void}
 */
function arrowFunc() {}

function classicFunc() {}

/**
 * A declared function.
 * With multiple lines in its description.
 * @param {number} value - The value.
 */
function declaredFunc() {}

/**
 * @summary A let-defined arrow function.
 */
function letArrowFunc() {}

function varFuncExpr() {}

/**
 * An exported function with JSDoc.
 * @param {object} data - Some data.
 * @returns {boolean} Success status.
 */
function exportedFunc() {}

function anotherOneBitesTheDust() {}`.trim(); // Use .trim() to remove leading/trailing whitespace from template literal if any

  const result = await generateGasEntryPoints("test/fixtures/functions.js");
  assertEquals(result.trim(), expectedOutput); // Also trim result just in case
});

Deno.test("generateGasEntryPoints should throw for non-existent file", async () => {
  await assertRejects(
    async () => {
      await generateGasEntryPoints("test/fixtures/non_existent_file.js");
    },
    Error, // Deno.errors.NotFound, but Error is more general
    // No specific message check here, as it might vary slightly by Deno version or OS
  );
});
