import { isMathExpression } from './mathParser';

export interface CommandResult {
  isCommand: boolean;
  message?: string;
  action?: 'desmos' | 'test' | 'clear' | 'help';
  data?: any;
}

export function processCommand(input: string): CommandResult {
  // Trim the input for consistent processing
  const trimmedInput = input.trim();
  
  // Process special commands
  if (trimmedInput.startsWith('/')) {
    const commandText = trimmedInput.substring(1).toLowerCase();
    
    // Test command to check if the interface is working
    if (commandText === 'test' || commandText === 'test') {
      return {
        isCommand: true,
        message: "The chat interface is working correctly!",
        action: 'test'
      };
    }
    
    // Clear command to clear the chat history
    if (commandText === 'clear' || commandText === 'reset') {
      return {
        isCommand: true,
        action: 'clear'
      };
    }
    
    // Help command to show available commands
    if (commandText === 'help') {
      return {
        isCommand: true,
        message: `
Available commands:
- /test - Test if the chat interface is working
- /clear - Clear the conversation history
- /desmos [expression] - Plot a mathematical expression (e.g., /desmos y=x^2)
- /help - Show this help message

For mathematical visualizations, mention terms like calculus, trigonometry, or algebra, 
or use explicit mathematical notations in your message.
`,
        action: 'help'
      };
    }
    
    // Desmos command to plot a mathematical expression
    if (commandText.startsWith('desmos')) {
      const expression = trimmedInput.substring(8).trim();
      if (expression) {
        return {
          isCommand: true,
          message: `Plotting expression: ${expression}`,
          action: 'desmos',
          data: { expression }
        };
      } else {
        return {
          isCommand: true,
          message: "Please provide a mathematical expression to plot (e.g., /desmos y=x^2)."
        };
      }
    }
    
    // Unknown command
    return {
      isCommand: true,
      message: `Unknown command: ${commandText}. Type /help for available commands.`
    };
  }
  
  // Check if the input might be a mathematical expression (not starting with a command)
  if (isMathExpression(trimmedInput)) {
    return {
      isCommand: true,
      message: `I've detected a mathematical expression: "${trimmedInput}". Here's the visualization:`,
      action: 'desmos',
      data: { expression: trimmedInput }
    };
  }
  
  // Not a command
  return {
    isCommand: false
  };
} 