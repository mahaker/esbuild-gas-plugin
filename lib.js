import * as ts from "https://esm.sh/typescript@5.5.4";

export async function generateGasEntryPoints(filePath) {
  try {
    const code = await Deno.readTextFile(filePath);
    const sourceFile = ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.ESNext,
      true
    );

    const definedFunctions = new Map();
    const globalAssignments = [];

    function visit(node) {
      let functionName = null;
      let params = [];
      let functionAstNode = null;
      let jsDocTargetNode = null;

      if (ts.isFunctionDeclaration(node) && node.name) {
        functionName = node.name.text;
        functionAstNode = node;
        jsDocTargetNode = node;
      } else if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (decl.name && ts.isIdentifier(decl.name)) {
            if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
              functionName = decl.name.text;
              functionAstNode = decl.initializer;
              jsDocTargetNode = node;
              if(decl.jsDoc?.length) jsDocTargetNode = decl;
            }
          }
        }
      }

      if (functionName && functionAstNode) {
        let currentParams = [];
        if (functionAstNode.parameters) {
          functionAstNode.parameters.forEach(param => {
            if (ts.isIdentifier(param.name)) {
              currentParams.push({
                name: param.name.text,
                type: param.type ? param.type.getText(sourceFile) : "any"
              });
            }
          });
        }
        let currentJsDocText = "";
        if (jsDocTargetNode?.jsDoc?.length) {
          jsDocTargetNode.jsDoc.forEach(doc => {
            currentJsDocText += sourceFile.text.substring(doc.pos, doc.end) + '\n';
          });
          if (currentJsDocText.endsWith('\n')) currentJsDocText = currentJsDocText.slice(0, -1);
        }
        if (!definedFunctions.has(functionName)) {
            definedFunctions.set(functionName, {
              name: functionName,
              parameters: currentParams,
              jsDocText: currentJsDocText,
              astNode: functionAstNode
            });
        }
      }

      if (ts.isExpressionStatement(node)) {
        if (ts.isBinaryExpression(node.expression) && node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
          const left = node.expression.left;
          const right = node.expression.right;
          if (ts.isPropertyAccessExpression(left)) {
            const objName = left.expression.getText(sourceFile);
            if (["global", "globalThis", "window"].includes(objName)) {
              const globalPropertyName = left.name.getText(sourceFile);
              let assignedIdentifierName = null;
              let assignedAstNode = null;
              let jsDocFromAssignmentContext = "";
              if (ts.isFunctionExpression(right) || ts.isArrowFunction(right)) {
                assignedAstNode = right;
                if (right.jsDoc?.length) {
                    right.jsDoc.forEach(doc => { jsDocFromAssignmentContext += sourceFile.text.substring(doc.pos, doc.end) + '\n'; });
                } else if (node.jsDoc?.length) {
                    node.jsDoc.forEach(doc => { jsDocFromAssignmentContext += sourceFile.text.substring(doc.pos, doc.end) + '\n'; });
                }
              } else if (ts.isIdentifier(right)) {
                assignedIdentifierName = right.getText(sourceFile);
                if (node.jsDoc?.length) {
                    node.jsDoc.forEach(doc => { jsDocFromAssignmentContext += sourceFile.text.substring(doc.pos, doc.end) + '\n'; });
                }
              }
              if(jsDocFromAssignmentContext.endsWith('\n')) jsDocFromAssignmentContext = jsDocFromAssignmentContext.slice(0,-1);
              if (globalPropertyName && (assignedIdentifierName || assignedAstNode)) {
                globalAssignments.push({
                  globalName: globalPropertyName,
                  assignedIdentifierName: assignedIdentifierName,
                  assignedAstNode: assignedAstNode,
                  jsDocTextFromAssignmentContext: jsDocFromAssignmentContext
                });
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);

    const resolvedEntryPoints = [];
    for (const assignment of globalAssignments) {
      let funcDetailsToProcess = null;
      let entryPointName = assignment.globalName;
      let jsDocForAugmentation = assignment.jsDocTextFromAssignmentContext;

      if (assignment.assignedAstNode) {
        let params = [];
        assignment.assignedAstNode.parameters.forEach(param => {
          if (ts.isIdentifier(param.name)) {
            params.push({
              name: param.name.text,
              type: param.type ? param.type.getText(sourceFile) : "any"
            });
          }
        });
        funcDetailsToProcess = {
          name: entryPointName,
          parameters: params,
          jsDocText: jsDocForAugmentation,
          astNode: assignment.assignedAstNode
        };
      } else if (assignment.assignedIdentifierName) {
        const foundFunc = definedFunctions.get(assignment.assignedIdentifierName);
        if (foundFunc) {
          const effectiveJsDoc = jsDocForAugmentation || foundFunc.jsDocText;
          funcDetailsToProcess = {
            ...foundFunc,
            name: entryPointName,
            jsDocText: effectiveJsDoc
          };
        }
      }

      if (funcDetailsToProcess) {
        const existingParamNamesFromJsDoc = new Set();
        const originalJsDocLines = funcDetailsToProcess.jsDocText ? funcDetailsToProcess.jsDocText.split('\n') : [];

        const descriptionLinesContent = [];
        const otherOriginalTagLinesContent = []; // Store content of other tags
        const originalParamTagLinesContent = []; // Store content of @param tags

        originalJsDocLines.forEach(line => {
          let processedLine = line.trim();
          if (processedLine.startsWith('/**')) processedLine = processedLine.substring(3).trimStart();
          if (processedLine.endsWith('*/')) processedLine = processedLine.substring(0, processedLine.length - 2).trimEnd();
          if (processedLine.startsWith('*')) processedLine = processedLine.substring(1).trimStart();

          if (processedLine.startsWith('@param')) {
            originalParamTagLinesContent.push(processedLine);
            const paramMatch = processedLine.match(/^@param\s+(?:\{[^}]*\}\s+)?([a-zA-Z0-9_]+)/);
            if (paramMatch && paramMatch[1]) {
              existingParamNamesFromJsDoc.add(paramMatch[1]);
            }
          } else if (processedLine.startsWith('@')) {
            otherOriginalTagLinesContent.push(processedLine);
          } else if (processedLine.length > 0) {
            descriptionLinesContent.push(processedLine);
          }
        });

        const newParamTagsContent = [];
        funcDetailsToProcess.parameters.forEach(param => {
          if (!existingParamNamesFromJsDoc.has(param.name)) {
            const typeStr = param.type || "any";
            newParamTagsContent.push(`@param {${typeStr}} ${param.name}`);
          }
        });

        let finalJsDocString = "";
        if (descriptionLinesContent.length > 0 || otherOriginalTagLinesContent.length > 0 || originalParamTagLinesContent.length > 0 || newParamTagsContent.length > 0) {
          const linesForBlock = ["/**"];
          descriptionLinesContent.forEach(content => linesForBlock.push(` * ${content}`.trimEnd()));

          // Add separator if description and any tags exist
          if (descriptionLinesContent.length > 0 && (otherOriginalTagLinesContent.length > 0 || originalParamTagLinesContent.length > 0 || newParamTagsContent.length > 0)) {
            if (descriptionLinesContent.some(d => d.trim() !== '')) { // only if description wasn't just empty lines
                 linesForBlock.push(" *");
            }
          }

          otherOriginalTagLinesContent.forEach(tagContent => linesForBlock.push(` * ${tagContent}`));
          originalParamTagLinesContent.forEach(tagContent => linesForBlock.push(` * ${tagContent}`));
          newParamTagsContent.forEach(tagContent => linesForBlock.push(` * ${tagContent}`)); // newParamTagsContent are already " * @param..." but this adds another " * "

          linesForBlock.push(" */");
          finalJsDocString = linesForBlock.join('\n');
        }

        // Correction for newParamTagsContent prefixing:
        // newParamTagsContent should just be the tag text, not " * @param..."
        // Let's redefine newParamTags and their addition to linesForBlock.
        // This was actually correct in the test version: newParamTagLines.push(` * @param {${typeStr}} ${param.name}`);
        // The issue is in the final loop: newParamTagsContent.forEach(tagContent => linesForBlock.push(` * ${tagContent}`));
        // This adds an extra " * ".
        // The code below uses the newParamTagsContent as defined above, which is just the tag text.
        // The previous implementation's `newParamTagLines` was better as it included the " * ".
        // Reverting to that style for `newParamTags` for simplicity with the loop.

        // Corrected JSDoc Assembly
        const finalJsDocLines_corrected = [];
        if (descriptionLinesContent.length > 0 || otherOriginalTagLinesContent.length > 0 || originalParamTagLinesContent.length > 0 || newParamTagsContent.length > 0) {
            finalJsDocLines_corrected.push("/**");
            // 1. Other original tags (e.g., @summary)
            otherOriginalTagLinesContent.forEach(tagContent => finalJsDocLines_corrected.push(` * ${tagContent}`));
            // 2. Description content
            descriptionLinesContent.forEach(content => finalJsDocLines_corrected.push(` * ${content}`.trimEnd()));
            // 3. Original @param tags
            originalParamTagLinesContent.forEach(tagContent => finalJsDocLines_corrected.push(` * ${tagContent}`));
            // 4. New @param tags (already just content, need " * " prefix)
            newParamTagsContent.forEach(tagContent => finalJsDocLines_corrected.push(` * ${tagContent}`));

            finalJsDocLines_corrected.push(" */");
            finalJsDocString = finalJsDocLines_corrected.join('\n');
        }


        const paramNamesOnly = funcDetailsToProcess.parameters.map(p => p.name).join(", ");
        const finalSignature = `function ${entryPointName}(${paramNamesOnly}) {}`;

        resolvedEntryPoints.push(
          finalJsDocString ? `${finalJsDocString}\n${finalSignature}` : finalSignature
        );
      }
    }
    return resolvedEntryPoints.join('\n\n');

  } catch (error) {
    console.error(`Error in generateGasEntryPoints: ${filePath}`, error);
    throw error;
  }
}
