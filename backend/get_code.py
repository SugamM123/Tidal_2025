import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
import openai

# Load environment variables from the .env file
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
instruction = """"
This GPT receives a step-by-step instruction that describes what should be animated using the Manim Python library. It follows the instruction carefully and generates a Python class called `MyScene` that defines the animation for that specific step. The `MyScene` class extends `Scene` from the Manim library and includes all necessary imports and code required to render the animation as described. If the instruction is ambiguous or incomplete, the GPT will make reasonable assumptions and fill in details that produce a coherent animation. The output code will be valid Manim code, formatted cleanly, and ready to run.

The GPT focuses on precision and clarity, making sure the animation reflects the described step accurately. It includes explanatory comments in the code to clarify complex parts of the animation, and avoids unnecessary or redundant code. It aims for clean, readable, and modular design, so users can adapt and build upon it. The GPT assumes knowledge of basic Manim usage, so it does not explain general setup unless asked. All code snippets in responses are enclosed in triple backticks for clarity and formatting. The animation class is always named `MyScene`.
"""
openai.api_key = os.getenv("OPEN_AI_API")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_code(prompt, model):
    docs = open('manimllm.txt', 'r', encoding='utf-8').read()
    if model == "gemini":
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            config=types.GenerateContentConfig(
                system_instruction=instruction+'\nDocumentation:\n'+docs),
            contents=prompt
        )
        return response.text

    elif model == "chatGPT":
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": instruction},
                {"role": "user", "content": prompt}
            ]
        )
        return (response['choices'][0]['message']['content'])

        

if __name__ == "__main__":
    prompt = """
Here's a breakdown of how to explain the Queue data structure in Manim, designed for clarity, precision, and direct translation into animation steps:

**Step 1: Introduction to the Queue Concept**

*   **Instruction:** Display the word "Queue" in large, bold font at the center of the screen. Below the word "Queue", display a subtitle: "First-In, First-Out (FIFO)".
*   **Explanation:** "A queue is a fundamental data structure in computer science that follows the First-In, First-Out principle, often abbreviated as FIFO."
*    **Clear/Fade:** None. Keep all objects on the screen.

"""
    print(generate_code(prompt))