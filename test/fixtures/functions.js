// Fixture for testing global assignment logic

/**
 * @summary A locally defined function.
 * @param {number} a - First parameter.
 */
const localFunc = (a: number) => {
  console.log(a);
};

/**
 * @summary Another local function, will be assigned to global with a different name.
 * @param {string} b - Second parameter.
 */
function myOriginalFunctionName(b: string): void {
  // JSDoc for b will be generated
}

// This function is NOT assigned to global
const notAGlobalFunction = (x: number, y: number) => {
  return x + y;
};

/**
 * @summary This JSDoc is for the assignment itself.
 * The function 'localFunc' (which has its own JSDoc) is assigned to global.hoge
 */
global.hoge = localFunc;

// Assigning myOriginalFunctionName to global.anotherEntryPoint
// No JSDoc on this assignment statement itself.
global.anotherEntryPoint = myOriginalFunctionName;

/**
 * @summary This is a direct assignment of an anonymous function to a global.
 * @param {boolean} c - A boolean parameter.
 */
global.directAssignment = (c: boolean) => {
  // JSDoc for c will be generated
  return !c;
};

// Assignment to globalThis
globalThis.onGlobalThis = (d: string, e: any) => {
    // d and e params will be generated
    console.log(d,e);
};

// Assignment to window
/**
 * @summary Assigned to window object.
 */
window.onWindow = function(f: number) {
    // f param will be generated
    console.log(f);
};

// A function that is defined but never assigned globally
function purelyLocal(p1: string) {
    console.log(p1);
}

// Assigning an identifier that doesn't point to a defined function (should be ignored)
global.pointsToNothing = undefinedIdentifier;

// Assigning a non-function value (should be ignored)
global.notAFunction = "hello";
