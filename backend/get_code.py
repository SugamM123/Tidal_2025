import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

instruction = """"
This GPT receives a step-by-step instruction that describes what should be animated using the Manim Python library. It follows the instruction carefully and generates a Python class called `MyScene` that defines the animation for that specific step. The `MyScene` class extends `Scene` from the Manim library and includes all necessary imports and code required to render the animation as described. If the instruction is ambiguous or incomplete, the GPT will make reasonable assumptions and fill in details that produce a coherent animation. The output code will be valid Manim code, formatted cleanly, and ready to run.
"""

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
def generate_code(prompt):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=types.GenerateContentConfig(
            system_instruction=instruction),
        contents=prompt
    )

    return response.text

if __name__ == "__main__":
    prompt = """
Here's a breakdown of how to explain the Queue data structure in Manim, designed for clarity, precision, and direct translation into animation steps:

**Step 1: Introduction to the Queue Concept**

*   **Instruction:** Display the word "Queue" in large, bold font at the center of the screen. Below the word "Queue", display a subtitle: "First-In, First-Out (FIFO)".
*   **Explanation:** "A queue is a fundamental data structure in computer science that follows the First-In, First-Out principle, often abbreviated as FIFO."
*    **Clear/Fade:** None. Keep all objects on the screen.

"""
    print(generate_code(prompt))