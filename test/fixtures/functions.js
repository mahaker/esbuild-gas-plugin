/**
 * A function with full JSDoc already.
 * @param {number} x - The first number.
 * @param {string} y - The second string.
 */
function fullyDocumented(x_val: number, y_val: string) {} // Using different param names in impl

/**
 * A function with partial JSDoc.
 * @param name - The name. Note: no type in JSDoc, but type in signature.
 */
function partiallyDocumented(name: string, age: number, city: string) {} // 'age' and 'city' params are missing from JSDoc

// Function with type annotations but no JSDoc at all.
function noJsDocTyped(value: boolean, settings: object) {}

// Function with no type annotations and no JSDoc.
function noJsDocNoTypes(p1, p2_val) {}

/**
 * An arrow function with types and partial JSDoc.
 * @param {string} message - The message to log.
 */
export const arrowWithTypesAndPartialJsDoc = (message: string, count: number) => {
  // 'count' is missing from JSDoc
  console.log(message, count);
};

// An arrow function with no types and no JSDoc
const simpleArrowFunc = (a, b) => a + b;

/**
 * @summary A function with existing JSDoc but no @param tags.
 * It has parameters in its signature.
 */
function jsDocNoParams(id: number, type: string) {}

// Function with JSDoc @param for a non-existing param, and missing one for existing.
/**
 * @param {string} old_param - This parameter no longer exists.
 */
function mismatchedParams(current_param: number) {}
