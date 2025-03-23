interface MathDetectionResult {
  hasEquation: boolean;
  latex: string;
  type: 'function' | 'equation' | 'inequality' | 'point' | 'unknown';
}

// Simple regex patterns to identify common math expressions
const FUNCTION_PATTERN = /y\s*=\s*([^=;\n]+)/i;
const EQUATION_PATTERN = /([^=;\n]+)\s*=\s*([^=;\n]+)/i;
const INEQUALITY_PATTERN = /([^<>;\n]+)\s*[<>]=?\s*([^<>;\n]+)/i;
const POINT_PATTERN = /\(\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)\s*\)/;
const GRAPH_COMMAND_PATTERN = /(?:graph|plot|draw|show)\s+([^;\n]+)/i;

/**
 * Detect if text contains a mathematical expression and return it in LaTeX format
 */
export function detectMathExpression(text: string): MathDetectionResult {
  // Clean the text
  const cleanText = text.trim().toLowerCase();
  
  // Check if it's a direct request to graph something
  const graphCommand = cleanText.match(GRAPH_COMMAND_PATTERN);
  if (graphCommand) {
    // Convert the expression after "graph" or "plot" to LaTeX
    return processExpression(graphCommand[1]);
  }
  
  // If it's not a direct command, check for equations in the entire text
  if (FUNCTION_PATTERN.test(cleanText)) {
    const match = cleanText.match(FUNCTION_PATTERN);
    if (match) {
      return {
        hasEquation: true,
        latex: `y=${processLatexExpression(match[1])}`,
        type: 'function'
      };
    }
  }
  
  if (INEQUALITY_PATTERN.test(cleanText)) {
    const match = cleanText.match(INEQUALITY_PATTERN);
    if (match) {
      const operator = cleanText.includes('<=') 
        ? '\\le' 
        : cleanText.includes('>=') 
          ? '\\ge' 
          : cleanText.includes('<') 
            ? '<' 
            : '>';
      
      return {
        hasEquation: true,
        latex: `${processLatexExpression(match[1])}${operator}${processLatexExpression(match[2])}`,
        type: 'inequality'
      };
    }
  }
  
  if (EQUATION_PATTERN.test(cleanText)) {
    const match = cleanText.match(EQUATION_PATTERN);
    if (match) {
      return {
        hasEquation: true,
        latex: `${processLatexExpression(match[1])}=${processLatexExpression(match[2])}`,
        type: 'equation'
      };
    }
  }
  
  if (POINT_PATTERN.test(cleanText)) {
    const match = cleanText.match(POINT_PATTERN);
    if (match) {
      return {
        hasEquation: true,
        latex: `(${match[1]},${match[2]})`,
        type: 'point'
      };
    }
  }
  
  // If nothing specific was found, try some more aggressive matching
  const possibleExpression = extractPossibleExpression(cleanText);
  if (possibleExpression) {
    return {
      hasEquation: true,
      latex: processLatexExpression(possibleExpression),
      type: 'unknown'
    };
  }
  
  return {
    hasEquation: false,
    latex: '',
    type: 'unknown'
  };
}

/**
 * Process a detected expression into a proper LaTeX format
 */
function processExpression(expr: string): MathDetectionResult {
  // Clean the expression
  const cleanExpr = expr.trim();
  
  // Check if it's a function form (y = f(x))
  if (FUNCTION_PATTERN.test(cleanExpr)) {
    const match = cleanExpr.match(FUNCTION_PATTERN);
    if (match) {
      return {
        hasEquation: true,
        latex: `y=${processLatexExpression(match[1])}`,
        type: 'function'
      };
    }
  }
  
  // Check if it's an equation (a = b)
  if (EQUATION_PATTERN.test(cleanExpr)) {
    const match = cleanExpr.match(EQUATION_PATTERN);
    if (match) {
      return {
        hasEquation: true,
        latex: `${processLatexExpression(match[1])}=${processLatexExpression(match[2])}`,
        type: 'equation'
      };
    }
  }
  
  // If we couldn't identify a specific format, just process as a raw expression
  return {
    hasEquation: true,
    latex: processLatexExpression(cleanExpr),
    type: 'unknown'
  };
}

/**
 * Convert common mathematical notation to LaTeX
 */
function processLatexExpression(expr: string): string {
  let result = expr.trim();
  
  // Handle integral notation
  result = result.replace(/(?:the)?(?:\s*)integral(?:\s*)of(?:\s*)([^d]+)(?:\s*)d([a-z])/gi, '\\int $1 d$2');
  result = result.replace(/(?:the)?(?:\s*)indefinite(?:\s*)integral(?:\s*)of(?:\s*)([^d]+)(?:\s*)d([a-z])/gi, '\\int $1 d$2');
  result = result.replace(/(?:the)?(?:\s*)definite(?:\s*)integral(?:\s*)from(?:\s*)([^\s]+)(?:\s*)to(?:\s*)([^\s]+)(?:\s*)of(?:\s*)([^d]+)(?:\s*)d([a-z])/gi, '\\int_{$1}^{$2} $3 d$4');
  
  // Handle derivative notation
  result = result.replace(/(?:the)?(?:\s*)derivative(?:\s*)of(?:\s*)([^w]+)(?:\s*)with(?:\s*)respect(?:\s*)to(?:\s*)([a-z])/gi, '\\frac{d}{d$2}($1)');
  result = result.replace(/(?:the)?(?:\s*)derivative(?:\s*)of(?:\s*)([^w]+)/gi, '\\frac{d}{dx}($1)');
  
  // Handle limit notation
  result = result.replace(/(?:the)?(?:\s*)limit(?:\s*)as(?:\s*)([a-z])(?:\s*)(?:approaches|->|→|goes to)(?:\s*)([^o]+)(?:\s*)of(?:\s*)([^$]+)/gi, '\\lim_{$1 \\to $2} $3');
  
  // Handle sum notation
  result = result.replace(/(?:the)?(?:\s*)sum(?:\s*)from(?:\s*)([^t]+)(?:\s*)to(?:\s*)([^o]+)(?:\s*)of(?:\s*)([^$]+)/gi, '\\sum_{$1}^{$2} $3');
  
  // Handle product notation
  result = result.replace(/(?:the)?(?:\s*)product(?:\s*)from(?:\s*)([^t]+)(?:\s*)to(?:\s*)([^o]+)(?:\s*)of(?:\s*)([^$]+)/gi, '\\prod_{$1}^{$2} $3');
  
  // Handle fractions with "over"
  result = result.replace(/([^/\s]+)(?:\s*)over(?:\s*)([^/\s]+)/gi, '\\frac{$1}{$2}');
  
  // Handle vectors
  result = result.replace(/vector(?:\s*)\(([^)]+)\)/gi, '\\vec{$1}');
  
  // Handle matrices
  const matrixPattern = /matrix(?:\s*)\[\s*([^;]+);(?:\s*)([^;]+)(?:;(?:\s*)([^;]+))?(?:;(?:\s*)([^;]+))?\s*\]/gi;
  result = result.replace(matrixPattern, (match, row1, row2, row3, row4) => {
    let matrixStr = '\\begin{bmatrix}';
    matrixStr += row1.replace(/,/g, ' & ');
    matrixStr += '\\\\';
    matrixStr += row2.replace(/,/g, ' & ');
    if (row3) {
      matrixStr += '\\\\';
      matrixStr += row3.replace(/,/g, ' & ');
    }
    if (row4) {
      matrixStr += '\\\\';
      matrixStr += row4.replace(/,/g, ' & ');
    }
    matrixStr += '\\end{bmatrix}';
    return matrixStr;
  });

  // Replace ^ with LaTeX power notation
  result = result.replace(/(\w+|\([^)]+\))\s*\^\s*(\w+|\([^)]+\))/g, (_, base, exp) => {
    return `${base}^{${exp}}`;
  });
  
  // Replace sqrt with LaTeX square root
  result = result.replace(/sqrt\s*\(([^)]+)\)/g, '\\sqrt{$1}');
  result = result.replace(/square\s*root\s*of\s*([^,\.]+)/gi, '\\sqrt{$1}');
  result = result.replace(/cubic\s*root\s*of\s*([^,\.]+)/gi, '\\sqrt[3]{$1}');
  result = result.replace(/(\d+)(?:th|rd|nd|st)\s*root\s*of\s*([^,\.]+)/gi, '\\sqrt[$1]{$2}');
  
  // Replace trig functions with LaTeX versions
  result = result.replace(/sin\s*\(([^)]+)\)/g, '\\sin($1)');
  result = result.replace(/cos\s*\(([^)]+)\)/g, '\\cos($1)');
  result = result.replace(/tan\s*\(([^)]+)\)/g, '\\tan($1)');
  result = result.replace(/cot\s*\(([^)]+)\)/g, '\\cot($1)');
  result = result.replace(/sec\s*\(([^)]+)\)/g, '\\sec($1)');
  result = result.replace(/csc\s*\(([^)]+)\)/g, '\\csc($1)');
  
  // Replace inverse trig functions
  result = result.replace(/arcsin\s*\(([^)]+)\)/g, '\\arcsin($1)');
  result = result.replace(/arccos\s*\(([^)]+)\)/g, '\\arccos($1)');
  result = result.replace(/arctan\s*\(([^)]+)\)/g, '\\arctan($1)');
  
  // Replace logarithms
  result = result.replace(/log\s*\(([^)]+)\)/g, '\\log($1)');
  result = result.replace(/ln\s*\(([^)]+)\)/g, '\\ln($1)');
  result = result.replace(/log_(\w+)\s*\(([^)]+)\)/g, '\\log_{$1}($2)');
  result = result.replace(/logarithm\s*base\s*(\w+)\s*of\s*([^,\.]+)/gi, '\\log_{$1}{$2}');
  
  // Replace constants
  result = result.replace(/\bpi\b/g, '\\pi');
  result = result.replace(/\binf(inity)?\b/g, '\\infty');
  result = result.replace(/\be\b/g, '\\mathrm{e}');
  
  // Replace operations
  result = result.replace(/\sdot\s/g, ' \\cdot ');
  result = result.replace(/\stimes\s/g, ' \\times ');
  
  // Replace inequality symbols
  result = result.replace(/\sle\s/g, ' \\leq ');
  result = result.replace(/\sge\s/g, ' \\geq ');
  result = result.replace(/\sneq\s/g, ' \\neq ');
  
  // Replace text inside some keywords
  result = result.replace(/the\s+indefinite\s+integral:/g, '\\int');
  result = result.replace(/learn\s+the\s+notation:/g, '');
  
  return result;
}

/**
 * Try to extract a potential mathematical expression from text
 */
function extractPossibleExpression(text: string): string | null {
  // Look for patterns that might indicate a mathematical expression
  const patterns = [
    // Match anything that looks like a function or equation
    /[yx]\s*=\s*([^=;.\n]+)/i,
    // Match expressions with common math operators
    /([+-]?\s*\d+\.?\d*\s*[+\-*/^]\s*[^=;.\n]+)/,
    // Match expressions with variables and operators
    /([a-z]\s*[+\-*/^]\s*[^=;.\n]+)/i,
    // Match anything in parentheses that could be a math expression
    /\(\s*([^)(]+)\s*\)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  
  return null;
}

/**
 * Check if a response should show a graph based on content
 */
export function shouldShowGraph(text: string): boolean {
  // Only show graph for specific mathematical terms
  const mathTerms = [
    'equation', 'function', 'graph', 'plot', 'integration', 'integral',
    'derivative', 'differentiate', 'sine', 'cosine', 'tangent',
    'trigonometry', 'algebra', 'calculus', 'polynomial', 'quadratic',
    'logarithm', 'exponential', 'matrix', 'vector', 'limit',
    'sum', 'series', 'sequence', 'probability', 'statistics'
  ];
  
  const lowerText = text.toLowerCase();
  
  // Check if any math term is present in the text
  const hasMathTerm = mathTerms.some(term => lowerText.includes(term));
  
  // Also check for common mathematical notations
  const hasEquation = /y\s*=|f\(x\)|=\s*[^=]|\\frac|\\int|\\sum|\\prod|\\lim/i.test(lowerText);
  
  return hasMathTerm || hasEquation;
}

/**
 * Combine multiple detected expressions into a single graph
 */
export function combineExpressions(expressions: string[]): string {
  return expressions.join(',');
}

// Add a function to check if a string contains a math expression
export function isMathExpression(text: string): boolean {
  // Patterns that indicate a math expression
  const mathPatterns = [
    // Basic equations
    /^y\s*=\s*[\w\s\+\-\*\/\^\(\)\{\}\[\]]+$/i,  // y = ...
    /^f\s*\(\s*x\s*\)\s*=\s*[\w\s\+\-\*\/\^\(\)\{\}\[\]]+$/i,  // f(x) = ...
    
    // Common functions
    /\b(sin|cos|tan|log|ln|exp|sqrt|abs)\s*\(/i,
    
    // LaTeX notation
    /\\(int|sum|prod|lim|frac|sqrt|vec|hat|bar|dot)/i,
    
    // Matrix notation
    /\\begin\{(matrix|pmatrix|bmatrix|vmatrix|Vmatrix)\}/i,
    
    // Calculus phrases
    /the\s+(derivative|integral|limit|sum|product)\s+of/i,
    /\b(differentiate|integrate)\b/i,
    
    // Mathematical symbols
    /[∫∑∏∂√∞≤≥≠±×÷∇∆Δ∀∃∈∉⊂⊃⊆⊇∧∨¬⇒⇔]/,
    
    // Simple expressions with operators and functions
    /^[\w\s\+\-\*\/\^\(\)\{\}\[\]]+\s*=\s*[\w\s\+\-\*\/\^\(\)\{\}\[\]]+$/,
    
    // Multiple operators or complex expression
    /(\+|\-|\*|\/|\^|\(|\)){3,}/,
    
    // Desmos specific
    /\\left|\\right|\\frac|\\cdot|\\vec|\\overrightarrow/i,
  ];
  
  // Check if any math pattern matches
  return mathPatterns.some(pattern => pattern.test(text));
}

// Function to convert natural language to LaTeX
export function naturalLanguageToLatex(text: string): string {
  let result = text;
  
  // Convert integral expressions
  result = result.replace(
    /the\s+indefinite\s+integral\s+of\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)\s*d([a-z])/i,
    '\\int $1 \\mathrm{d}$2'
  );
  
  result = result.replace(
    /the\s+integral\s+of\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)\s*d([a-z])/i,
    '\\int $1 \\mathrm{d}$2'
  );
  
  // Convert derivative expressions
  result = result.replace(
    /the\s+derivative\s+of\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)\s*with\s+respect\s+to\s+([a-z])/i,
    '\\frac{d}{d$2}($1)'
  );
  
  result = result.replace(
    /the\s+derivative\s+of\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)/i,
    '\\frac{d}{dx}($1)'
  );
  
  // Convert limit expressions
  result = result.replace(
    /the\s+limit\s+as\s+([a-z])\s+approaches\s+([^\s]+)\s+of\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)/i,
    '\\lim_{$1 \\to $2} $3'
  );
  
  // Convert sum expressions
  result = result.replace(
    /the\s+sum\s+from\s+([a-z])\s*=\s*([^\s]+)\s+to\s+([^\s]+)\s+of\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)/i,
    '\\sum_{$1=$2}^{$3} $4'
  );
  
  // Convert product expressions
  result = result.replace(
    /the\s+product\s+from\s+([a-z])\s*=\s*([^\s]+)\s+to\s+([^\s]+)\s+of\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)/i,
    '\\prod_{$1=$2}^{$3} $4'
  );
  
  // Convert fraction expressions
  result = result.replace(
    /the\s+fraction\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)\s+over\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)/i,
    '\\frac{$1}{$2}'
  );
  
  // Convert sqrt expressions
  result = result.replace(
    /the\s+square\s+root\s+of\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)/i,
    '\\sqrt{$1}'
  );
  
  result = result.replace(
    /the\s+([^\s]+)\s+root\s+of\s+([^\s]+(?:\s*[\+\-\*\/\^]\s*[^\s]+)*)/i,
    '\\sqrt[$1]{$2}'
  );
  
  // Basic function conversions
  const functionMappings = [
    { name: 'sin', regex: /sin\s*\(/gi, latex: '\\sin(' },
    { name: 'cos', regex: /cos\s*\(/gi, latex: '\\cos(' },
    { name: 'tan', regex: /tan\s*\(/gi, latex: '\\tan(' },
    { name: 'cot', regex: /cot\s*\(/gi, latex: '\\cot(' },
    { name: 'sec', regex: /sec\s*\(/gi, latex: '\\sec(' },
    { name: 'csc', regex: /csc\s*\(/gi, latex: '\\csc(' },
    { name: 'arcsin', regex: /arcsin\s*\(/gi, latex: '\\arcsin(' },
    { name: 'arccos', regex: /arccos\s*\(/gi, latex: '\\arccos(' },
    { name: 'arctan', regex: /arctan\s*\(/gi, latex: '\\arctan(' },
    { name: 'ln', regex: /ln\s*\(/gi, latex: '\\ln(' },
    { name: 'log', regex: /log\s*\(/gi, latex: '\\log(' },
    { name: 'exp', regex: /exp\s*\(/gi, latex: '\\exp(' },
  ];
  
  functionMappings.forEach(fn => {
    result = result.replace(fn.regex, fn.latex);
  });
  
  return result;
}

export function containsGraphKeywords(text: string): boolean {
  const graphKeywords = [
    'graph', 'plot', 'draw', 'visualize', 'show', 'display',
    'equation', 'function', 'curve', 'integral', 'derivative',
    'limit', 'sum', 'product', 'differential', 'calculus',
    'polynomial', 'sine', 'cosine', 'tangent', 'logarithm',
    'exponential', 'quadratic', 'linear', 'parabola', 'hyperbola',
    'ellipse', 'circle', 'trigonometric', 'algebra', 'vertex',
    'asymptote', 'extrema', 'minimum', 'maximum', 'intercept',
    'root', 'zero', 'domain', 'range', 'intersection'
  ];
  
  const lowerText = text.toLowerCase();
  return graphKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
} 