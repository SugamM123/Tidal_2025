import { ExcalidrawElement } from "@excalidraw/excalidraw";
import { GeminiService } from "../services/geminiService";

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
              "backgroundColor": "#4a8cff",
              "fillStyle": "solid",
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
              "baseline": 18
            }
          ],
          "description": "A simple diagram with a blue rectangle containing the text 'Hello World'."
        }
        
        Focus on creating a clean, readable diagram. Position elements thoughtfully.
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
  }
};