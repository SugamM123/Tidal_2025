from flask import Flask, jsonify, request
import os
import re
from manim import *
import openai
import dotenv
from flask_cors import CORS
import boto3
import glob
import shutil

dotenv.load_dotenv()
openai.api_key = os.getenv("OPEN_AI_API")

# Initialize a session using your credentials
session = boto3.Session(
    aws_access_key_id=os.getenv('aws_access_key_id'),
    aws_secret_access_key=os.getenv('aws_secret_access_key'),
    region_name='us-west-2'
)

# Create an S3 client
s3 = session.client('s3')

config.media_dir = "./out"

def generate_response(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "This GPT helps explain complex and abstract concepts by generating illustrative Python code using the Manim animation library. It breaks down big ideas into visual, understandable components through Manim animations, leveraging examples to teach effectively. The GPT produces code that can be run directly in a Manim environment (the class name should always be MyScene), guiding users through the logic and steps involved in each animation. Before writing any code, it clearly lists out the steps it will take to create the animation, ensuring the plan is understandable and logically sequenced. It assumes familiarity with Python but explains Manim-specific syntax and choices as needed. If a concept is too broad, it narrows the scope through clarification or proposes examples that illustrate key parts. It ensures that animations include plenty of motion and transitions to enhance visual engagement. The animation resolution is set for vertical short-form content with height of 1280 and width of 720. The GPT always provides the complete code at the end of the explanation, and all code blocks are wrapped in triple backticks (```), using proper syntax highlighting for Python. It avoids going off-topic or generating content not related to visual explanation or Manim code. The GPT aims to be clear, instructive, and efficient in converting concepts into animated visuals."},
            {"role": "user", "content": prompt}
        ]
    )
    return (response['choices'][0]['message']['content'])

app = Flask(__name__)
CORS(app, origins=["https://tidal-2025.pages.dev"])

# Enable CORS for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/run', methods=['GET'])
def run_code():
    prompt = request.args.get('prompt')
    if not prompt:
        return jsonify({"error": "Prompt parameter is missing."}), 400

    res = generate_response(prompt)
    pattern = r'```(?:python)?\s*(.*?)```'
    match = re.search(pattern, res, re.DOTALL)
    
    # Extract code from the response.
    if match:
        code = match.group(1)
    else:
        code = "Error: No code found in the response."

    # Execute the extracted code in the same scope.
    try:
        global_namespace = {}
        exec(code, global_namespace)
        global_namespace["MyScene"]().render()
    except Exception as e:
        return jsonify({"error": f"Something broke: {e}"}), 500

    # Specify the bucket name and the file to upload
    bucket_name = 'alpha-tidal-2025'
    video_files = glob.glob("./out/videos/**/*.mp4", recursive=True)
    if not video_files:
        return jsonify({"error": "No .mp4 file found in the specified directory."}), 500
    file_path = video_files[0]
    object_name = file_path.split("/")[-1]

    # Upload the file
    with open(file_path, 'rb') as data:
        s3.upload_fileobj(data, bucket_name, object_name)
    # Generate a presigned URL for the uploaded file
    url = s3.generate_presigned_url(
        ClientMethod='get_object',
        Params={'Bucket': bucket_name, 'Key': object_name},
        ExpiresIn=None
    )
    print(f'File uploaded to {bucket_name}/{object_name}')
    print(f"Direct sharable link: {url}")

    if os.path.exists(config.media_dir):
        for item in os.listdir(config.media_dir):
            item_path = os.path.join(config.media_dir, item)
            try:
                if os.path.isfile(item_path) or os.path.islink(item_path):
                    os.unlink(item_path)
                elif os.path.isdir(item_path):
                    shutil.rmtree(item_path)
            except Exception as e:
                print(f'Failed to delete {item_path}. Reason: {e}')
    return jsonify({"video_url": url})

@app.route('/api/welcome')
def home():
    return jsonify(message="SUP")

if __name__ == '__main__':
    # Use the PORT environment variable provided by Render
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)