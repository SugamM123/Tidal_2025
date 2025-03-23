import { ExcalidrawElement } from "@excalidraw/excalidraw";
import { GeminiService } from "../services/geminiService";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

// Assuming geminiService is an instance of the GeminiService class
const geminiService = new GeminiService();

// This defines the format we expect from the AI response
interface GeneratedDrawingResponse {
  elements: ExcalidrawElement[];
  description: string;
}

export const excalidrawService = {
  async generateDiagram(prompt: string): Promise<ExcalidrawElement[]> {
    try {
      // Check if this is a Mermaid diagram request
      const isMermaidRequest = prompt.toLowerCase().includes('mermaid') || 
                              prompt.toLowerCase().includes('flowchart') ||
                              prompt.toLowerCase().includes('erdiagram') ||
                              prompt.toLowerCase().includes('gitgraph');
      
      if (isMermaidRequest) {
        return await this.generateMermaidDiagram(prompt);
      } else {
        return await this.generateAIDiagram(prompt);
      }
    } catch (error) {
      console.error("Error generating Excalidraw diagram:", error);
      
      // Return a default error diagram
      return [{
        id: "error-text",
        type: "text",
        x: 100,
        y: 100,
        width: 300,
        height: 50,
        text: "Error generating diagram: " + (error instanceof Error ? error.message : "Unknown error"),
        fontSize: 20,
        fontFamily: 1,
        textAlign: "left",
        verticalAlign: "top",
        baseline: 18
      } as ExcalidrawElement];
    }
  },
  
  async generateMermaidDiagram(prompt: string): Promise<ExcalidrawElement[]> {
    try {
      // Define a system prompt that asks the AI to generate Mermaid syntax
      const systemPrompt = `
        You are a diagram creation assistant. Create a Mermaid diagram based on the user's request.
        Output ONLY valid Mermaid syntax without any additional text, explanation, or markdown.
        
        Focus on creating a clean, readable diagram that follows Mermaid syntax.
        
        Example of valid Mermaid flowchart:
        
        flowchart TD
          A[Start] --> B{Decision}
          B -->|Yes| C[Process]
          B -->|No| D[End]
          C --> D
      `;
      
      // Send the prompt to the AI model
      const aiResponse = await geminiService.sendMessage(
        `${systemPrompt}\n\nCreate a Mermaid diagram for: ${prompt}`
      );
      
      // Try to extract the Mermaid syntax from the response
      let mermaidSyntax = aiResponse.trim();
      
      // Extract Mermaid syntax if it's in a code block
      const codeBlockMatch = mermaidSyntax.match(/```(?:mermaid)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        mermaidSyntax = codeBlockMatch[1].trim();
      }
      
      console.log("Mermaid syntax:", mermaidSyntax);
      
      // Convert Mermaid to Excalidraw with options for better visibility
      const { elements } = await parseMermaidToExcalidraw(mermaidSyntax, {
        fontSize: 18,
        darkMode: true,
        backgroundColor: "#000000",
        strokeColor: "#ffffff"
      });
      
      // Apply vibrant color processing to the elements
      const vibrantElements = elements.map(element => {
        const newElement = { ...element };
        
        // Make text white for readability
        if (newElement.type === 'text') {
          newElement.strokeColor = '#ffffff';
        }
        
        // Make shape colors vibrant
        if (['rectangle', 'diamond', 'ellipse', 'line', 'arrow'].includes(newElement.type)) {
          // Use a predefined set of vibrant colors
          const vibrantColors = [
            '#ff0066', '#00ffff', '#ffff00', '#ff6600', '#00ff00',
            '#ff00ff', '#ff3366', '#66ff33', '#3366ff'
          ];
          
          // Assign vibrant colors based on some property of the element
          const colorIndex = Math.abs(newElement.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % vibrantColors.length;
          
          if (newElement.backgroundColor) {
            newElement.backgroundColor = vibrantColors[colorIndex];
          }
          
          if (newElement.strokeColor) {
            // Use white for stroke color to create contrast
            newElement.strokeColor = '#ffffff';
          }
          
          // Increase stroke width for visibility
          if (newElement.strokeWidth) {
            newElement.strokeWidth = Math.max(2, newElement.strokeWidth);
          }
        }
        
        return newElement;
      });
      
      // Convert to Excalidraw elements
      return convertToExcalidrawElements(vibrantElements);
      
    } catch (error) {
      console.error("Failed to generate Mermaid diagram:", error);
      throw new Error("Failed to generate Mermaid diagram: " + (error instanceof Error ? error.message : "unknown error"));
    }
  },
  
  async generateAIDiagram(prompt: string): Promise<ExcalidrawElement[]> {
    // Define a system prompt that asks the AI to generate an Excalidraw diagram
    const systemPrompt = `
      You are a diagram creation assistant. Create an Excalidraw diagram based on the user's request.
      Output ONLY valid JSON for Excalidraw elements with this structure:
      { 
        "elements": [
          // Array of Excalidraw elements following the Excalidraw element schema
        ],
        "description": "Brief description of the diagram"
      }
      
      IMPORTANT: Since the diagram will be displayed on a black background, use VIBRANT, HIGH-SATURATION colors for all elements.
      Use colors such as:
      - #ff0066 (hot pink)
      - #00ffff (cyan)
      - #ffff00 (yellow)
      - #ff6600 (orange)
      - #00ff00 (green)
      - #ff00ff (magenta)
      - #ff3366 (coral red)
      - #66ff33 (lime green)
      - #3366ff (bright blue)
      - #ffffff (white for text and outlines)
      
      For text elements, use white (#ffffff) or very bright colors.
      
      Increase the stroke width to at least 2 for all elements for better visibility.
      
      Here's an example of a simple diagram with a rectangle and text:
      {
        "elements": [
          {
            "id": "rect1",
            "type": "rectangle",
            "x": 100,
            "y": 100,
            "width": 200,
            "height": 100,
            "backgroundColor": "#ff0066",
            "fillStyle": "solid",
            "strokeColor": "#ffffff",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 1,
            "opacity": 100
          },
          {
            "id": "text1",
            "type": "text",
            "x": 150,
            "y": 140,
            "width": 100,
            "height": 20,
            "text": "Hello World",
            "fontSize": 20,
            "fontFamily": 1,
            "textAlign": "center",
            "verticalAlign": "middle",
            "strokeColor": "#ffffff",
            "baseline": 18
          }
        ],
        "description": "A simple diagram with a hot pink rectangle containing the text 'Hello World'."
      }
      
      Focus on creating a clean, readable diagram with VIBRANT colors that pop against a black background.
    `;

    // Send the prompt to the AI model
    const aiResponse = await geminiService.sendMessage(
      `${systemPrompt}\n\nCreate an Excalidraw diagram for: ${prompt}`
    );

    // Parse the AI response and convert it to ExcalidrawElements
    try {
      // Extract JSON from the response (handling potential markdown code blocks)
      const jsonMatch = aiResponse.match(/```(?:json)?([\s\S]*?)```/) || 
                       [null, aiResponse];
      
      const jsonText = jsonMatch[1].trim();
      const parsedResponse = JSON.parse(jsonText) as GeneratedDrawingResponse;
      
      // Validate the response format
      if (!parsedResponse.elements || !Array.isArray(parsedResponse.elements)) {
        throw new Error("Invalid response format from AI");
      }
      
      return parsedResponse.elements;
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw AI response:", aiResponse);
      
      // Return a default error diagram
      return [{
        id: "error-text",
        type: "text",
        x: 100,
        y: 100,
        width: 300,
        height: 50,
        text: "Error generating diagram. Please try again with a clearer prompt.",
        fontSize: 20,
        fontFamily: 1,
        textAlign: "left",
        verticalAlign: "top",
        baseline: 18
      } as ExcalidrawElement];
    }
  }
};