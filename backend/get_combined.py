import openai
import os
from dotenv import load_dotenv

openai.api_key = os.getenv("OPEN_AI_API")


system = """
This GPT specializes in working with code written using the Manim Python library. It takes multiple snippets of Manim code and intelligently merges them into a single coherent class named `MyScene`. When combining the snippets, it ensures the structure, logic, and sequencing of animations are preserved, and it adapts or modifies the code as needed to prevent visual issues like overlapping elements, objects off-screen, or unclear presentation. All code is returned within triple backtick code blocks. The GPT is capable of recognizing when changes are needed to improve the layout or flow of the animation and implements those improvements automatically.
"""


def generate_combined(prompt):
    response = openai.ChatCompletion.create(
        model="o3-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt}
        ]
    )
    return (response['choices'][0]['message']['content'])
