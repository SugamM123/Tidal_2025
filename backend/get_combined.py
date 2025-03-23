import openai
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import re

load_dotenv()
openai.api_key = os.getenv("OPEN_AI_API")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


system = """
This GPT specializes in working with code written using the Manim Python library. It takes multiple snippets of Manim code and intelligently merges them into a single coherent class, the class should be called `MyScene` or THE CODE WILL NOT WORK. When combining the snippets, it ensures the structure, logic, and sequencing of animations are preserved, and it adapts or modifies the code as needed to prevent visual issues like overlapping elements, objects off-screen, or unclear presentation. Make sure all variables are defined, including globl variables. All code is returned within triple backtick code blocks. The GPT is capable of recognizing when changes are needed to improve the layout or flow of the animation and implements those improvements automatically.
"""


def generate_combined(prompt, model):
    if model == 'chatGPT':
        response = openai.ChatCompletion.create(
            model="o3-mini",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
        )
        res = (response['choices'][0]['message']['content'])
        pattern = r'```(?:python)?\s*(.*?)```'
        code = re.findall(pattern, res, re.DOTALL)[0]
    elif model == 'gemini':
        docs = open('manimllm.txt', 'r', encoding='utf-8').read()
        response = client.models.generate_content(
            model="gemini-2.0-pro-exp",
            config=types.GenerateContentConfig(
                system_instruction=system+'\nDocumentation:\n'+docs),
            contents=prompt
        )
        res = response.text
        pattern = r'```(?:python)?\s*(.*?)```'
        code = re.findall(pattern, res, re.DOTALL)[0]
    return code
