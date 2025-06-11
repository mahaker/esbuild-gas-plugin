import * as ts from "https://esm.sh/typescript@5.5.4";

export async function generateGasEntryPoints(filePath) {
  try {
    const code = await Deno.readTextFile(filePath);
    const sourceFile = ts.createSourceFile(
      filePath, // fileName
      code, // sourceText
      ts.ScriptTarget.ESNext, // languageVersion
      true // setParentNodes
    );

    const entryPoints = [];

    function visit(node) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        // Handles: function funcName() {}
        entryPoints.push(`function ${node.name.text}() {}`);
      } else if (ts.isVariableStatement(node)) {
        // Handles: const funcName = ...; let funcName = ...; var funcName = ...;
        for (const decl of node.declarationList.declarations) {
          if (decl.name && ts.isIdentifier(decl.name)) {
            // Check if the initializer is a function type
            if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
              entryPoints.push(`function ${decl.name.text}() {}`);
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return entryPoints.join('\n');
  } catch (error) {
    console.error(`Error reading or parsing file with TypeScript Compiler API: ${filePath}`, error);
    throw error; // Re-throw the error
  }
}
