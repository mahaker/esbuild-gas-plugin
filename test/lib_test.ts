import { assertEquals, assertRejects } from "https://deno.land/std@0.207.0/testing/asserts.ts";
import { generateGasEntryPoints } from "../lib.js"; // Corrected path

Deno.test("generateGasEntryPoints should correctly parse, augment JSDoc, and format signatures", async () => {
  const expectedOutput = `/**
 * A function with full JSDoc already.
 * @param {number} x - The first number.
 * @param {string} y - The second string.
 * @param {number} x_val
 * @param {string} y_val
 */
function fullyDocumented(x_val, y_val) {}

/**
 * A function with partial JSDoc.
 * @param name - The name. Note: no type in JSDoc, but type in signature.
 * @param {number} age
 * @param {string} city
 */
function partiallyDocumented(name, age, city) {}

/**
 * @param {boolean} value
 * @param {object} settings
 */
function noJsDocTyped(value, settings) {}

/**
 * @param {any} p1
 * @param {any} p2_val
 */
function noJsDocNoTypes(p1, p2_val) {}

/**
 * An arrow function with types and partial JSDoc.
 * @param {string} message - The message to log.
 * @param {number} count
 */
function arrowWithTypesAndPartialJsDoc(message, count) {}

/**
 * @param {any} a
 * @param {any} b
 */
function simpleArrowFunc(a, b) {}

/**
 * @summary A function with existing JSDoc but no @param tags.
 * It has parameters in its signature.
 * @param {number} id
 * @param {string} type
 */
function jsDocNoParams(id, type) {}

/**
 * @param {string} old_param - This parameter no longer exists.
 * @param {number} current_param
 */
function mismatchedParams(current_param) {}`.trim();

  const result = await generateGasEntryPoints("test/fixtures/functions.js");
  assertEquals(result.trim(), expectedOutput);
});

Deno.test("generateGasEntryPoints should throw for non-existent file", async () => {
  await assertRejects(
    async () => {
      await generateGasEntryPoints("test/fixtures/non_existent_file.js");
    },
    Error
  );
});
