/**
 * This is an arrow function.
 * @param {string} param1 - A parameter.
 * @returns {void}
 */
const arrowFunc = (param1) => {
  console.log("I am an arrow function", param1);
};

// This function has no JSDoc
const classicFunc = function() {
  console.log("I am a classic function expression");
};

/**
 * A declared function.
 * With multiple lines in its description.
 * @param {number} value - The value.
 */
function declaredFunc(value) {
  console.log("I am a declared function", value);
}

const notAFunction = "hello"; // Should not be picked up

/**
 * @summary A let-defined arrow function.
 */
let letArrowFunc = () => {};

var varFuncExpr = function() { /* No JSDoc here */ };

/**
 * An exported function with JSDoc.
 * @param {object} data - Some data.
 * @returns {boolean} Success status.
 */
export const exportedFunc = (data) => {
    console.log("Exported func", data);
    return true;
};

function anotherOneBitesTheDust() {} // No JSDoc
