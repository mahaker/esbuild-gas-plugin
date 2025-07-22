import * as ts from "https://esm.sh/typescript@5.1.6";

interface FunctionInfo {
  name: string;
  params: string[];
  leadingComments?: string;
}

export function generateGlobalFunctionStubs(filePath: string): string {
  const sourceCode = Deno.readTextFileSync(filePath);
  
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const functions: FunctionInfo[] = [];
  
  function visit(node: ts.Node) {
    // Find 'global' function assignments
    if (ts.isExpressionStatement(node) && ts.isBinaryExpression(node.expression)) {
      const expression = node.expression;
      
      if (
        expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(expression.left) &&
        ts.isIdentifier(expression.left.expression) &&
        expression.left.expression.text === "global" &&
        ts.isIdentifier(expression.left.name)
      ) {
        const functionName = expression.left.name.text;
        const rightSide = expression.right;
        
        let params: string[] = [];
        let leadingComments = "";
        
        const fullText = sourceFile.getFullText();
        
        if (ts.isIdentifier(rightSide)) {
          const functionDeclaration = findFunctionDeclaration(sourceFile, rightSide.text);
          const functionDefinitionNode = findFunctionDefinitionNode(sourceFile, rightSide.text);
          
          if (functionDeclaration) {
            params = extractParameters(functionDeclaration);
            // Function comment.
            if (functionDefinitionNode) {
              const funcComments = ts.getLeadingCommentRanges(fullText, functionDefinitionNode.getFullStart());
              if (funcComments && funcComments.length > 0) {
                const comment = funcComments[funcComments.length - 1];
                leadingComments = fullText.substring(comment.pos, comment.end).trim();
              }
            }
          }
        } else if (ts.isFunctionExpression(rightSide) || ts.isArrowFunction(rightSide)) {
          params = extractParameters(rightSide);
        }
        
        functions.push({
          name: functionName,
          params,
          leadingComments
        });
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  
  return generateFunctionDefinitions(functions);
}

function findFunctionDeclaration(sourceFile: ts.SourceFile, functionName: string): ts.FunctionDeclaration | ts.VariableDeclaration | null {
  let result: ts.FunctionDeclaration | ts.VariableDeclaration | null = null;
  
  function visit(node: ts.Node) {
    // function
    if (ts.isFunctionDeclaration(node) && node.name?.text === functionName) {
      result = node;
      return;
    }
    
    // const/let/var
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text === functionName) {
          if (declaration.initializer && 
              (ts.isFunctionExpression(declaration.initializer) || 
               ts.isArrowFunction(declaration.initializer))) {
            result = declaration;
            return;
          }
        }
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return result;
}

function findFunctionDefinitionNode(sourceFile: ts.SourceFile, functionName: string): ts.Node | null {
  let result: ts.Node | null = null;
  
  function visit(node: ts.Node) {
    // function
    if (ts.isFunctionDeclaration(node) && node.name?.text === functionName) {
      result = node;
      return;
    }
    
    // const/let/var
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text === functionName) {
          if (declaration.initializer && 
              (ts.isFunctionExpression(declaration.initializer) || 
               ts.isArrowFunction(declaration.initializer))) {
            result = node;
            return;
          }
        }
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return result;
}

function extractParameters(node: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction | ts.VariableDeclaration): string[] {
  let parameters: ts.ParameterDeclaration[] = [];
  
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    parameters = Array.from(node.parameters);
  } else if (ts.isVariableDeclaration(node) && node.initializer) {
    if (ts.isFunctionExpression(node.initializer) || ts.isArrowFunction(node.initializer)) {
      parameters = Array.from(node.initializer.parameters);
    }
  }
  
  return parameters.map(param => {
    if (ts.isIdentifier(param.name)) {
      return param.name.text;
    }
    return "param"; // e.g. Destructuring paramters, Spread syntax
  });
}

function generateFunctionDefinitions(functions: FunctionInfo[]): string {
  return functions.map(func => {
    const params = func.params.join(", ");
    let result = "";
    
    if (func.leadingComments) {
      result += func.leadingComments + "\n";
    }
    
    result += `function ${func.name}(${params}) {}`;
    
    return result;
  }).join("\n\n");
}
