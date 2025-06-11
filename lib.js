import * as ts from "https://esm.sh/typescript@5.5.4";

export async function generateGasEntryPoints(filePath) {
  try {
    const code = await Deno.readTextFile(filePath);
    const sourceFile = ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.ESNext,
      true // setParentNodes to allow JSDoc retrieval
    );

    const entryPoints = [];

    function visit(node) {
      let functionName = null;
      let targetNodeForJsDoc = null; // The node that might have JSDoc comments

      if (ts.isFunctionDeclaration(node) && node.name) {
        functionName = node.name.text;
        targetNodeForJsDoc = node;
      } else if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (decl.name && ts.isIdentifier(decl.name)) {
            if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
              functionName = decl.name.text;
              // JSDoc is often on the VariableStatement for const/let/var.
              // However, it can also be directly on the VariableDeclaration for more specific cases.
              // We prioritize JSDoc on the VariableStatement if available.
              // If not, check the VariableDeclaration itself (especially for arrow functions).
              if (node.jsDoc && node.jsDoc.length > 0) {
                targetNodeForJsDoc = node; // VariableStatement
              } else {
                targetNodeForJsDoc = decl; // VariableDeclaration
              }
            }
          }
        }
      }

      if (functionName && targetNodeForJsDoc) {
        let jsDocComment = "";
        // Check if jsDoc property exists and is an array
        if (targetNodeForJsDoc.jsDoc && Array.isArray(targetNodeForJsDoc.jsDoc)) {
            targetNodeForJsDoc.jsDoc.forEach(doc => {
                // Reconstruct the full JSDoc block text from the source file
                const fullCommentText = sourceFile.text.substring(doc.pos, doc.end);
                jsDocComment += fullCommentText + '\n'; // Add newline after each JSDoc block
            });
        }

        // Clean up trailing newline from the concatenated jsDocComment block
        if (jsDocComment.endsWith('\n')) {
            jsDocComment = jsDocComment.slice(0, -1); // Remove the last newline character
        }

        if (jsDocComment) {
          entryPoints.push(`${jsDocComment}\nfunction ${functionName}() {}`);
        } else {
          entryPoints.push(`function ${functionName}() {}`);
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return entryPoints.join('\n\n'); // Separate entries by two newlines
  } catch (error) {
    console.error(`Error reading or parsing file with TypeScript Compiler API: ${filePath}`, error);
    throw error;
  }
}
