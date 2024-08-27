import * as TS from "https://esm.sh/typescript@5.5.4";
// @deno-types="../generate.d.ts"
import { generate } from "https://esm.sh/gas-entry-generator@2.1.0";

export function getVersion(): string {
  return TS.version;
}

export function getGasEntryPointFunctions(code: string): string {
  const gas = generate(code, { comment: true });
  return gas.entryPointFunctions;
}

/**
 * TODO: find function definitions with comment.
 * ref: https://stackoverflow.com/questions/47429792/is-it-possible-to-get-comments-as-nodes-in-the-ast-using-the-typescript-compiler
 * TODO: save scanned file path. if scanned file and ignore this.
 */
// export function getEntryPointFunctions(code: string): void {
//   const source = TS.createSourceFile("hoge.ts", code, TS.ScriptTarget.ES2015)
export async function getEntryPointFunctions(path: string): Promise<void> {
  const code = await Deno.readTextFile(path)
  const source = TS.createSourceFile("hoge.ts", code, TS.ScriptTarget.ES2015)

  source.forEachChild(node => {
    visitExpressionStatement(node)
  });
}

function visitExpressionStatement(node: TS.Node): void {
  if (!TS.isExpressionStatement(node)) return;

  node.forEachChild(expression => {
    visitBinaryExpression(expression)
  });
}

function visitBinaryExpression(node: TS.Node): void {
  if (!TS.isBinaryExpression(node)) return;

  node.forEachChild(expression => {
    visitPropertyAccessExpression(expression)
  });
}

function visitPropertyAccessExpression(node: TS.Node): void {
  if (
    TS.isPropertyAccessExpression(node)
    && TS.isIdentifier(node.expression)
    && node.expression.escapedText === "global"
  ) {
    console.log("Global Assignment!!", node.name.escapedText)
  }
}
