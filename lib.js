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

    const extractedFunctions = [];

    function visit(node) {
      let functionName = null;
      let params = [];
      let originalParamsString = "";
      let targetNodeForJsDoc = null;
      let astNodeForParams = null;

      if (ts.isFunctionDeclaration(node) && node.name) {
        functionName = node.name.text;
        astNodeForParams = node;
        targetNodeForJsDoc = node;
      } else if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (decl.name && ts.isIdentifier(decl.name)) {
            if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
              functionName = decl.name.text;
              astNodeForParams = decl.initializer;
              if (node.jsDoc && node.jsDoc.length > 0) {
                targetNodeForJsDoc = node;
              } else if (decl.jsDoc && decl.jsDoc.length > 0) {
                targetNodeForJsDoc = decl;
              } else {
                targetNodeForJsDoc = node;
              }
            }
          }
        }
      }

      if (functionName && astNodeForParams) {
        if (astNodeForParams.parameters) {
          originalParamsString = sourceFile.text.substring(astNodeForParams.parameters.pos, astNodeForParams.parameters.end);
          astNodeForParams.parameters.forEach(param => {
            if (ts.isIdentifier(param.name)) {
              params.push({
                name: param.name.text,
                type: param.type ? param.type.getText(sourceFile) : "any"
              });
            }
          });
        }

        let jsDocText = "";
        if (targetNodeForJsDoc && targetNodeForJsDoc.jsDoc && targetNodeForJsDoc.jsDoc.length) {
            targetNodeForJsDoc.jsDoc.forEach(doc => {
                jsDocText += sourceFile.text.substring(doc.pos, doc.end) + '\n';
            });
            if (jsDocText.endsWith('\n')) {
                jsDocText = jsDocText.slice(0, -1);
            }
        }

        extractedFunctions.push({
          name: functionName,
          parameters: params,
          originalParamsString: originalParamsString,
          jsDocText: jsDocText,
        });
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // --- JSDoc Augmentation and Output Formatting ---
    const entryPoints = extractedFunctions.map(fn => {
      const existingParamNamesFromJsDoc = new Set();
      const originalJsDocLines = fn.jsDocText ? fn.jsDocText.split('\n') : [];

      const descriptionLinesContent = [];    // Store content of description lines (after stripping prefixes)
      const otherOriginalTagLines = [];    // Store full original non-@param tag lines
      const originalParamTagLines = [];    // Store full original @param tag lines

      originalJsDocLines.forEach(line => {
        const trimmedLine = line.trim();
        let analysisLine = trimmedLine;

        if (analysisLine.startsWith('/**')) analysisLine = analysisLine.substring(3).trimStart();
        if (analysisLine.endsWith('*/')) analysisLine = analysisLine.substring(0, analysisLine.length - 2).trimEnd();

        // For content extraction, remove leading asterisk and space for analysisLine
        // but store the original line for tags.
        let lineForAnalysis = analysisLine.startsWith('*') ? analysisLine.substring(1).trimStart() : analysisLine;

        if (lineForAnalysis.startsWith('@param')) {
          originalParamTagLines.push(line); // Store original line
          const paramMatch = lineForAnalysis.match(/^@param\s+(?:\{[^}]*\}\s+)?([a-zA-Z0-9_]+)/);
          if (paramMatch && paramMatch[1]) {
            existingParamNamesFromJsDoc.add(paramMatch[1]);
          }
        } else if (lineForAnalysis.startsWith('@')) {
          otherOriginalTagLines.push(line); // Store original line
        } else if (trimmedLine !== '/**' && trimmedLine !== '*/' && trimmedLine.length > 0) {
          // Only add if it's not an empty line after stripping prefixes for description
          if (lineForAnalysis.length > 0) {
            descriptionLinesContent.push(lineForAnalysis);
          }
        }
      });

      const newParamTagLines = []; // These will be new " * @param {type} name" lines
      fn.parameters.forEach(param => {
        if (!existingParamNamesFromJsDoc.has(param.name)) {
          const typeStr = param.type || "any";
          newParamTagLines.push(` * @param {${typeStr}} ${param.name}`);
        }
      });

      let finalJsDocString = "";
      if (descriptionLinesContent.length > 0 || otherOriginalTagLines.length > 0 || originalParamTagLines.length > 0 || newParamTagLines.length > 0) {
        const linesForBlock = ["/**"];
        // Output other non-@param tags first if they existed (e.g. @summary)
        otherOriginalTagLines.forEach(originalTagLine => linesForBlock.push(originalTagLine.trim().startsWith('*') ? ` ${originalTagLine.trim()}` : ` * ${originalTagLine.trim()}` ));

        // Then description
        descriptionLinesContent.forEach(content => linesForBlock.push(` * ${content}`.trimEnd()));

        // Add a separator " * " if there was description AND any @param tags follow (original or new)
        // AND if there were other tags already printed (to separate description from params, if summary was between them)
        // This separator logic is tricky. Let's rely on distinct content for now or handle spacing by ensuring content on each line.
        // If descriptionLinesContent and (originalParamTagLines or newParamTagLines) both have content,
        // Then all @param tags (original and new)
        // No explicit " *" separator line is added; tags directly follow description or other tags.
        originalParamTagLines.forEach(originalTagLine => linesForBlock.push(originalTagLine.trim().startsWith('*') ? ` ${originalTagLine.trim()}` : ` * ${originalTagLine.trim()}` ));
        newParamTagLines.forEach(newTagLine => linesForBlock.push(newTagLine)); // Already prefixed " * "

        linesForBlock.push(" */");
        finalJsDocString = linesForBlock.join('\n');
      }

      const paramNamesOnly = fn.parameters.map(p => p.name).join(", ");
      const finalSignature = `function ${fn.name}(${paramNamesOnly}) {}`;

      if (finalJsDocString) {
        return `${finalJsDocString}\n${finalSignature}`;
      }
      return finalSignature;
    });

    return entryPoints.join('\n\n');

  } catch (error) {
    console.error(`Error in generateGasEntryPoints: ${filePath}`, error);
    throw error;
  }
}
