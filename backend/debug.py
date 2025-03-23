from google import genai
from google.genai import types
from dotenv import load_dotenv
import os
import re


load_dotenv()

system = """
You are a debugging assistant. Analyze the provided code and error details, then produce the simplest, running version of the code. 
Only output the fixed code inside a Python code block.
\nDocumentation:\n
"""
system += open('manimllm.txt', 'r', encoding='utf-8').read()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def debug_code(code, error):
    response = client.models.generate_content(
        model="gemini-2.0-pro-exp",
        config=types.GenerateContentConfig(
            system_instruction=system),
        contents=f"Code:\n{code}\n\nError:\n{error}"
    )
    with open('debugging.txt', 'w') as f:
        f.write(code + "\n---\n" + error + "\n---\n" + response.text)
    res = response.text
    pattern = r'```(?:python)?\s*(.*?)```'
    code = re.findall(pattern, res, re.DOTALL)[0]
    return code
