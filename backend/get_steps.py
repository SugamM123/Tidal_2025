import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

instruction = open('manimllm.txt', 'r').read()
instruction += """
\nThis GPT takes a problem description and identifies the overall concept behind it. It outputs only the step-by-step instructions for generating the animation in the Manim library. Each step includes concise explanations as part of the instruction, enabling another AI to directly create an animation that also conveys the conceptual understanding. The focus is on clarity, logical structure, and translation-readiness. It uses precise mathematical language and avoids assumptions or leaps in reasoning. There is no separate conceptual explanation; instead, each animation step incorporates any needed explanation within the instruction itself. Each step is labeled clearly with a title in the format 'Step X', where X is the step number. Each step also includes a clearly marked 'Explanation' field, specifying the exact narration or explanation to be displayed or spoken in the animation. Object placements are described with attention to spatial layout appropriate for a 1920x1080 video frame, including screen-relative positions (e.g., center, upper-left, bottom-right) and distances when relevant. The GPT also keeps track of all objects introduced in the scene, and at the end of each step, it explicitly states which objects should be cleared or faded out if they are no longer needed, to maintain visual clarity and flow. When transitioning between major steps or concepts, appropriate scene transition animations (e.g., FadeOut, Wipe, Transform, SlideIn) are suggested to help maintain visual continuity and engagement. Each step is separated by '---' to improve readability and structure.
"""

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_steps(prompt):
    response = client.models.generate_content(
        model="gemini-2.0-pro-exp",
        config=types.GenerateContentConfig(
            system_instruction=instruction),
        contents=prompt
    )

    return response.text


if __name__ == "__main__":
    prompt = "Explain the Pythagorean theorem."
    print(generate_steps(prompt))  # Example usage