import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from '@google/generative-ai';

// Access the API key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);

// Create a service for chat interactions
export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  private chat: ChatSession | null = null;
  private useDirectMode = false;
  private history: { role: string; parts: { text: string }[] }[] = [];

  constructor() {
    // Initialize with a new chat session
    this.resetConversation();
  }

  // Method to send a message to Gemini and get a response
  async sendMessage(message: string) {
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // In direct mode, bypass the chat session
      if (this.useDirectMode) {
        console.log("Using direct mode for API call");
        const result = await this.model.generateContent(message);
        return result.response.text();
      }

      // Normal chat session mode
      console.log("Using chat session for API call");
      if (!this.chat) {
        throw new Error('Chat session not initialized');
      }

      // Keep track of the message in our history
      this.history.push({
        role: "user",
        parts: [{ text: message }]
      });

      const result = await this.chat.sendMessage(message);
      const response = result.response.text();

      // Keep track of the response in our history
      this.history.push({
        role: "model",
        parts: [{ text: response }]
      });

      return response;
    } catch (error) {
      console.error('Error communicating with Gemini API:', error);
      
      if (!this.useDirectMode) {
        // Try a simpler direct API call if the chat session fails
        try {
          console.log("Chat session failed, attempting direct API call...");
          this.useDirectMode = true; // Switch to direct mode for future calls
          const result = await this.model.generateContent(message);
          return result.response.text();
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          
          // Try one more time with a simplified message
          try {
            console.log("Attempting with simplified message...");
            const simplifiedMessage = `Please respond to: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;
            const result = await this.model.generateContent(simplifiedMessage);
            return result.response.text() + "\n\n(Note: I had to simplify your message due to API limitations.)";
          } catch (finalError) {
            console.error("All fallback attempts failed:", finalError);
            throw error; // Throw the original error
          }
        }
      } else {
        // Already in direct mode, try with simplified message
        try {
          console.log("Direct mode failed, attempting with simplified message...");
          const simplifiedMessage = `Please respond to: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;
          const result = await this.model.generateContent(simplifiedMessage);
          return result.response.text() + "\n\n(Note: I had to simplify your message due to API limitations.)";
        } catch (simplifiedError) {
          console.error("Simplified message attempt failed:", simplifiedError);
          throw error; // Throw the original error
        }
      }
    }
  }

  // Append content to history without expecting a response
  async appendToHistory(content: string) {
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Add to our internal history
      this.history.push({
        role: "user",
        parts: [{ text: content }]
      });

      if (this.useDirectMode) {
        console.log("In direct mode, can't actually append to history");
        return;
      }

      if (!this.chat) {
        throw new Error('Chat session not initialized');
      }

      // In chat session mode, we can send the message but we don't care about the response
      await this.chat.sendMessage(content);
      
      // No need to track the response as we don't display it to the user
      console.log("Content added to chat history");
      return;
    } catch (error) {
      console.error('Error appending to history:', error);
      this.useDirectMode = true; // Switch to direct mode for future interactions
      throw error;
    }
  }

  // Start a new conversation
  resetConversation() {
    try {
      // Reset direct mode flag
      this.useDirectMode = false;
      
      // Reset history
      this.history = [
        {
          role: "user",
          parts: [{ text: "Hello, please introduce yourself as Alpha Assistant." }],
        },
        {
          role: "model",
          parts: [{ text: "Hello! I'm Alpha Assistant, a helpful AI assistant designed to provide information, answer questions, and assist you with various tasks. How can I help you today?" }],
        },
      ];
      
      // Set up safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      // Create a new chat session
      this.chat = this.model.startChat({
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
        safetySettings,
        history: [
                    {
            role: "user",
            parts: [{ text: `
<intro>
You are Alpha Assistant, a helpful AI assistant designed to provide information, answer questions, and assist you with various tasks.
</intro>

<task>
Your main purpose is to help with STEM related tasks. 
</task>        

<tools>
You have access to the following tools:
Generally tools will be identified by a opening || and a closing || so DO NOT put any || in your message

Video: this will create a manim animation of the video.
Graph: this will create a desmos graph of the equations you want
Wolfram: make a query to wolfram alpha to get math answers to your questions to gaurentee correctness
Diagram: this will create a Excalidraw

You do not have to use all of the tools, you can choose only the ones you need. Remember to follow this format though DO NOT PUT DIAGRAM ABOVE VIDEO OR GRAPH MAKE SURE TO FOLLOW THE FORMAT!!!
</tools>

<VideoTool>
If you choose to use the Video tool, you will be able to create a video of the animation.

You will need to provide a description of the animation, and the video will be created in the following format:

Example Output:
||Create a video about ray marching with a camera in a 2D scene and a circle and a square. Show a ray leaving the camera and hitting the circle and the square.||

This description can be decently short but should contain enough details
</VideoTool>

<GraphTool>
If you choose to use the Graph tool, you will be able to create a graph of the equations you want.

This will be graphed on desmos, so you can use the desmos syntax to create the graph.
Input 1 will be the id, each id needs to be unique.
Input 2 will be the equation in latex form 
Input 3 will be the color

Example Output:
||line1,y=mx,#ff0000||

You can do multiple graphs at once, just separate them with a | symbol.

Example Output:
||line1,y=mx,#ff0000|line2,y=mx+1,#00ff00|line3,y=mx+2,#0000ff||

You can also use sliders:
Sliders are interactive elements the user can manipulate to change the graph.

Input 1 will be slider id, each id needs to be unique.
Input 2 will be the min value of the slider
Input 3 will be the max value of the slider
Input 4 will be the step size of the slider

The sliders are defined in the following format:
||m,m=initalvalue,#ff0000|m,min,max,step||
Make sure the IDS are the same for the slider and the declaration.

Of course, you can also combine sliders with graphs just first set the value then add the slider by matching the id:
||line1,y=mx,#ff0000|m,m=3,#00ff00|m,min,max,step||

All fields have to be filled to fully optimize the graph.
DO NOT USE MULTILETTER VARIABLES. please only use single letter variables. because words like sigma are going to be treated as s * i * g * m * a

</GraphTool>

<DiagramTool>
If you choose to use the Diagram tool, you will be able to create a diagram of anything using the power of Excalidraw.

This tool will use mermaid to excalidraw to create the diagrams

for an example you use the following format:
||
graph LR
    A[High Address] --> B(Return Address)
    B --> C(Old EBP)
    C --> D(Buffer)
    D --> E[Low Address]
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#ccf,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
    style D fill:#ccf,stroke:#333,stroke-width:2px
    style E fill:#f9f,stroke:#333,stroke-width:2px
||
</DiagramTool>

<WolframTool>
If you choose to use the Wolfram tool, you will be able to make a query to wolfram alpha to get math answers to your questions to gaurentee correctness

you can simply query wolfram alpha with the following format:
||wolfram alpha query||

</WolframTool>

<format>
When outputting feel free to use markdown syntax to format your output.

The frontmatter will contain the tools you used and their parameters.

the output should be in the EXACTfollowing format There should not be any text before the frontmatter nor after the last word. No ticks No block formatting. Nothing!. only frontmatter and then normal content:
---
Video||Generate a video of Signed Distance Fields Featuring 2 circles moving around the canvas with the signed distance fields on the screen reacting ||
Graph||line1,y=mx,#ff0000|m,m=3,#00ff00|m,-10,10,0.1||
Wolfram||x^3 = y + 68||
Diagram||
graph LR
    A[User Applications] --> B(Shell);
    B --> C{Libraries};
    C --> D[System Calls];
    D --> E((Kernel));
    E --> F[Hardware];
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#f9f,stroke:#333,stroke-width:2px
||
---

# The principles of Signed Distance Fields
Signed distance fields (SDFs) are a popular way to represent 3D shapes and surfaces. They are defined as a signed distance function, which assigns a distance value to each point in space. This distance value can be positive, negative, or zero, depending on the shape's surface normal at that point.

## Properties of Signed Distance Fields
SDFs have several interesting properties that make them useful for various applications. Some of these properties include:
- Being signed
- Calculating the distance to the shape's surface
- Being continuous
- Being differentiable
- Being a function of the shape's surface normal

## Applications of Signed Distance Fields
SDFs have a wide range of applications in computer graphics, including:
- Ray tracing
- Ray casting
- Ray marching
- Ray tracing

</format>
              
              ` }],
          },
          {
            role: "model",
            parts: [{ text: "Hello! I'm Alpha Assistant, a helpful AI assistant designed to provide information, answer questions, and assist you with various tasks. How can I help you today?" }],
          },
        ],
        // history: this.history,
      });
      


      return true;
    } catch (error) {
      console.error('Error resetting conversation:', error);
      
      // If chat creation fails, enable direct mode
      this.useDirectMode = true;
      this.chat = null;
      return false;
    }
  }
}

// Create a singleton instance for use throughout the app
export const geminiService = new GeminiService(); 