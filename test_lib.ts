import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { generateGlobalFunctionStubs } from "./lib.ts";

Deno.test("generateGlobalFunctionStubs - basic function extraction", async () => {
  const code = `
const greet = (name: string): void => {
  console.log('Hello ' + name)
}

const main1 = () => {
  greet('test')
}

declare let global: any
global.main1 = main1
`;

  const testFilePath = "./temp_test_basic.ts";
  await Deno.writeTextFile(testFilePath, code);

  try {
    const result = generateGlobalFunctionStubs(testFilePath);
    const expected = "function main1() {}";
    assertEquals(result, expected);
  } finally {
    await Deno.remove(testFilePath);
  }
});

Deno.test("generateGlobalFunctionStubs - multiple functions with JSDoc", async () => {
  const code = `
const greet = (msg: string): string => {
  return \`Hello \${msg} !\`;
}

/**
 * A sample function
 * @param {string} msg - A message
 * @return {string} Result
 */
const greet2 = (msg: string): string => {
  return \`Hello \${msg} !\`;
}

/**
 * An other sample function
 * @param {string} msg - A message
 * @return {string} Result
 */
function greet3(msg) {
  return \`Hello \${msg} !\`;
}

const greet4 = function(msg: string): string {
  return \`Hello \${msg} !\`;
}

const notTargetFunction = () => {}

declare let global: any;
global.greet = greet;
global.greet2 = greet2;
global.greet3 = greet3;
global.greet4 = greet4;
`;

  const testFilePath = "./temp_test_jsdoc.ts";
  await Deno.writeTextFile(testFilePath, code);

  try {
    const result = generateGlobalFunctionStubs(testFilePath);
    const expected = `function greet(msg) {}

/**
 * A sample function
 * @param {string} msg - A message
 * @return {string} Result
 */
function greet2(msg) {}

/**
 * An other sample function
 * @param {string} msg - A message
 * @return {string} Result
 */
function greet3(msg) {}

function greet4(msg) {}`;
    
    assertEquals(result, expected);
  } finally {
    await Deno.remove(testFilePath);
  }
});

Deno.test("generateGlobalFunctionStubs - function with multiple parameters", async () => {
  const code = `
const add = (a: number, b: number, c: number): number => {
  return a + b + c;
}

const multiply = function(x: number, y: number): number {
  return x * y;
}

function divide(numerator: number, denominator: number) {
  return numerator / denominator;
}

declare let global: any;
global.add = add;
global.multiply = multiply;
global.divide = divide;
`;

  const testFilePath = "./temp_test_params.ts";
  await Deno.writeTextFile(testFilePath, code);

  try {
    const result = generateGlobalFunctionStubs(testFilePath);
    const expected = `function add(a, b, c) {}

function multiply(x, y) {}

function divide(numerator, denominator) {}`;
    
    assertEquals(result, expected);
  } finally {
    await Deno.remove(testFilePath);
  }
});

Deno.test("generateGlobalFunctionStubs - no global assignments", async () => {
  const code = `
const greet = (name: string): void => {
  console.log('Hello ' + name)
}

const main1 = () => {
  greet('test')
}

// No global assignments
`;

  const testFilePath = "./temp_test_empty.ts";
  await Deno.writeTextFile(testFilePath, code);

  try {
    const result = generateGlobalFunctionStubs(testFilePath);
    assertEquals(result, "");
  } finally {
    await Deno.remove(testFilePath);
  }
});

Deno.test("generateGlobalFunctionStubs - function with no parameters", async () => {
  const code = `
const simpleFunc = () => {
  console.log('simple');
}

function anotherFunc() {
  return 42;
}

declare let global: any;
global.simpleFunc = simpleFunc;
global.anotherFunc = anotherFunc;
`;

  const testFilePath = "./temp_test_no_params.ts";
  await Deno.writeTextFile(testFilePath, code);

  try {
    const result = generateGlobalFunctionStubs(testFilePath);
    const expected = `function simpleFunc() {}

function anotherFunc() {}`;
    
    assertEquals(result, expected);
  } finally {
    await Deno.remove(testFilePath);
  }
});

Deno.test("generateGlobalFunctionStubs - mixed JSDoc styles", async () => {
  const code = `
/**
 * Block comment function
 */
const blockComment = (x: number) => x * 2;

/* Single line block comment */
const singleLineBlock = (y: string) => y.toUpperCase();

// Regular comment
const regularComment = (z: boolean) => !z;

declare let global: any;
global.blockComment = blockComment;
global.singleLineBlock = singleLineBlock;
global.regularComment = regularComment;
`;

  const testFilePath = "./temp_test_comments.ts";
  await Deno.writeTextFile(testFilePath, code);

  try {
    const result = generateGlobalFunctionStubs(testFilePath);
    const expected = `/**
 * Block comment function
 */
function blockComment(x) {}

/* Single line block comment */
function singleLineBlock(y) {}

// Regular comment
function regularComment(z) {}`;
    
    assertEquals(result, expected);
  } finally {
    await Deno.remove(testFilePath);
  }
});

Deno.test("generateGlobalFunctionStubs - destructuring parameters", async () => {
  const code = `
const destructureFunc = ({ name, age }: { name: string, age: number }) => {
  console.log(name, age);
}

const arrayDestructure = ([first, second]: [string, number]) => {
  return first + second;
}

declare let global: any;
global.destructureFunc = destructureFunc;
global.arrayDestructure = arrayDestructure;
`;

  const testFilePath = "./temp_test_destructure.ts";
  await Deno.writeTextFile(testFilePath, code);

  try {
    const result = generateGlobalFunctionStubs(testFilePath);
    const expected = `function destructureFunc(param) {}

function arrayDestructure(param) {}`;
    
    assertEquals(result, expected);
  } finally {
    await Deno.remove(testFilePath);
  }
});

Deno.test("generateGlobalFunctionStubs - No Type Assertion", async () => {
  const code = `
const greet = (msg) => {
  return \`Hello \${msg} !\`;
}

/**
 * A sample function
 * @param {string} msg - A message
 * @return {string} Result
 */
const greet2 = (msg) => {
  return \`Hello \${msg} !\`;
}

/**
 * An other sample function
 * @param {string} msg - A message
 * @return {string} Result
 */
function greet3(msg) {
  return \`Hello \${msg} !\`;
}

const greet4 = function(msg) {
  return \`Hello \${msg} !\`;
}

const notTargetFunction = () => {}

declare let global: any;
global.greet = greet;
global.greet2 = greet2;
global.greet3 = greet3;
global.greet4 = greet4;
`;

  const testFilePath = "./temp_test_jsdoc.ts";
  await Deno.writeTextFile(testFilePath, code);

  try {
    const result = generateGlobalFunctionStubs(testFilePath);
    const expected = `function greet(msg) {}

/**
 * A sample function
 * @param {string} msg - A message
 * @return {string} Result
 */
function greet2(msg) {}

/**
 * An other sample function
 * @param {string} msg - A message
 * @return {string} Result
 */
function greet3(msg) {}

function greet4(msg) {}`;
    
    assertEquals(result, expected);
  } finally {
    await Deno.remove(testFilePath);
  }
});

Deno.test("generateGlobalFunctionStubs - file does not exist", () => {
  let errorThrown = false;
  try {
    generateGlobalFunctionStubs("./non_existent_file.ts");
  } catch (error) {
    errorThrown = true;
  }
  assertEquals(errorThrown, true);
});
