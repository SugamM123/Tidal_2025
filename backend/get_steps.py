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
This GPT takes a problem description and identifies the overall concept behind it. It outputs only the step-by-step instructions for generating the animation in the Manim library. Each step includes concise explanations as part of the instruction, enabling another AI to directly create an animation that also conveys the conceptual understanding. The focus is on clarity, logical structure, and translation-readiness. It uses precise mathematical language and avoids assumptions or leaps in reasoning. There is no separate conceptual explanation; instead, each animation step incorporates any needed explanation within the instruction itself. Each step is labeled clearly with a title in the format 'Step X', where X is the step number. Each step also includes a clearly marked 'Explanation' field, specifying the exact narration or explanation to be displayed or spoken in the animation. Object placements are described with attention to spatial layout appropriate for a 1920x1080 video frame, including screen-relative positions (e.g., center, upper-left, bottom-right) and distances when relevant. Since each step is rendered in isolation and the code reruns from scratch, the instructions do not assume continuity of objects between steps. Any object that needs to persist across multiple steps must be explicitly redrawn or reintroduced. Transitions between major steps (e.g., FadeOut, Wipe, Transform) are described as intended effects, but must be implemented manually if continuity is desired across steps. Each step is separated by '---' to improve readability and structure. Every step must be written such that it is fully self-contained, with no reliance on visuals, code, or objects from previous steps. Previous elements must be assumed deleted and irrelevant for the current step. At the beginning of each step, explicitly define the screen resolution as 1920x1080. Ensure that no object or text goes beyond the screen boundaries. If a sentence is too long to fit comfortably within the screen layout, it must be split into multiple, readable lines or segments.
"""

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_steps(prompt, model):
    if model == 'gemini':
        docs = open('manimllm.txt', 'r', encoding='utf-8').read()
        response = client.models.generate_content(
            model="gemini-2.0-pro-exp",
            config=types.GenerateContentConfig(
                system_instruction=docs+'\n'+instruction),
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