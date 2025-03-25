from openai import OpenAI

from dotenv import load_dotenv
import os
import re


load_dotenv()

client = OpenAI(
    base_url = "https://openrouter.ai/api/v1",
    api_key = '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'
)
def debug_code(code, error):
    system = """
    You are a debugging assistant. Analyze the provided code and error details, then produce the simplest, running version of the code. 
    Only output the fixed code inside a Python code block.
    \nDocumentation:\n
    """
    system += open('manimllm.txt', 'r', encoding='utf-8').read()
    response = client.chat.completions.create(
        model='google/gemini-2.0-flash-001',
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"Code: {code}\nError: {error}"}
        ],
        max_tokens = 10000
    )
    response = (response.choices[0].message.content)

    with open('debugging.txt', 'w') as f:
        f.write(code + "\n---\n" + error + "\n---\n" + response)
    pattern = r'```(?:python)?\s*(.*?)```'
    code = re.findall(pattern, response, re.DOTALL)[0]
    return code