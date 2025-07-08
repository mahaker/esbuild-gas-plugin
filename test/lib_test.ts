import { assertEquals, assertRejects } from "https://deno.land/std@0.207.0/testing/asserts.ts";
import { generateGasEntryPoints } from "../lib.js"; // Corrected path

Deno.test("generateGasEntryPoints should extract only globally assigned functions with correct JSDoc and signatures", async () => {
  const expectedOutput = `/**
 * @summary This JSDoc is for the assignment itself.
 * The function 'localFunc' (which has its own JSDoc) is assigned to global.hoge
 * @param {number} a
 */
function hoge(a) {}

/**
 * @summary Another local function, will be assigned to global with a different name.
 * @param {string} b - Second parameter.
 */
function anotherEntryPoint(b) {}

/**
 * @summary This is a direct assignment of an anonymous function to a global.
 * @param {boolean} c - A boolean parameter.
 */
function directAssignment(c) {}

/**
 * @param {string} d
 * @param {any} e
 */
function onGlobalThis(d, e) {}

/**
 * @summary Assigned to window object.
 * @param {number} f
 */
function onWindow(f) {}`.trim();
  // Note: purelyLocal, notAGlobalFunction, pointsToNothing, notAFunction from fixture are NOT included.

  const result = await generateGasEntryPoints("test/fixtures/functions.js");
  assertEquals(result.trim(), expectedOutput);
});

Deno.test("generateGasEntryPoints should return empty for no global assignments", async () => {
  // Create a temporary file with functions but no global assignments
  const tempFilePath = await Deno.makeTempFile({ prefix: "test_no_globals", suffix: ".js" });
  try {
    await Deno.writeTextFile(tempFilePath,
      "const localFunc = () => {};\\nfunction anotherLocal() {}"
    );
    const result = await generateGasEntryPoints(tempFilePath);
    assertEquals(result.trim(), "");
  } finally {
    await Deno.remove(tempFilePath);
  }
});

Deno.test("generateGasEntryPoints should throw for non-existent file", async () => {
  await assertRejects(
    async () => {
      await generateGasEntryPoints("test/fixtures/non_existent_file.js");
    },
    Error
  );
});
