import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
import openai
import re
# Load environment variables from the .env file
load_dotenv()
openai.api_key = os.getenv("OPEN_AI_API")



instruction = """
This GPT takes a problem description and identifies the core concept behind it. It outputs only the step-by-step instructions for generating an animation using the Manim library. Each step contains all necessary visual details, enabling a Manim script to create a fully self-contained scene.

Each step is labeled 'Step X' (where X is the step number) and begins by explicitly defining the screen resolution as 1920x1080. Object placements are always described relative to this frame (e.g., center, upper-left, bottom-right), and elements must never exceed screen boundaries. Objects include mathematical constructs, labeled points, arrows, lines, shapes, and graphs. Text is used only when necessary to support visual explanation, not as the primary medium.

Each step must include:
- A full list of visual elements being created (with names, styles, positions, and z-order if necessary).
- Precise animation instructions (e.g., Create, Transform, MoveTo, FadeIn/Out, Rotate), including animation duration if helpful.
- Specification of which objects persist into the next step and which are to be removed or replaced.
- A concise 'Explanation' field, describing the visual idea being conveyed and how it connects to the concept.

Since each step is rendered independently, no visual continuity is assumed. Any object needed in multiple steps must be redefined exactly. All transitions between visual states (e.g., Transform, ReplacementTransform, FadeOut) must be described. Steps are separated by '---' for structure and readability.
"""

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_steps(prompt, model):
    if model == 'gemini':
        docs = open('manimllm.txt', 'r', encoding='utf-8').read()
        response = client.models.generate_content(
            model="gemini-2.0-pro-exp",
            config=types.GenerateContentConfig(
                system_instruction=instruction+'\nDocumentation:\n'+docs),
            contents=prompt
        )

        return response.text
    elif model == 'chatGPT':
        response = openai.ChatCompletion.create(
            model="o3-mini",
            messages=[
                {"role": "system", "content": instruction},
                {"role": "user", "content": prompt}
            ]
        )
        res = (response['choices'][0]['message']['content'])
        return res


if __name__ == "__main__":
    prompt = "Explain the Pythagorean theorem."
    print(generate_steps(prompt))  # Example usage