from flask import Flask, jsonify, request
import os
import re
from manim import *
import traceback
import dotenv
from flask_cors import CORS
import boto3
import glob
import shutil
from get_steps import generate_steps
from get_code import generate_code
from get_combined import generate_combined
from datetime import datetime
from moviepy import *

dotenv.load_dotenv()
# openai.api_key = os.getenv("OPEN_AI_API")

# Initialize a session using your credentials
session = boto3.Session(
    aws_access_key_id=os.getenv('aws_access_key_id'),
    aws_secret_access_key=os.getenv('aws_secret_access_key'),
    region_name='us-west-2'
)

# Create an S3 client
s3 = session.client('s3')

config.media_dir = "./out"

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
    snippets = []
    prompt = request.args.get('prompt')
    if not prompt:
        return jsonify({"error": "Prompt parameter is missing."}), 400

    print('Generating steps...')
    res = generate_steps(prompt, 'chatGPT')
    print('Steps generated.')

    steps = res.split("---")
    with open("out.txt", "w") as f:
        f.write("")

    for i, step in enumerate(steps):
        print(f'Generating code for step {i+1}/{len(steps)}...')
        code = generate_code(step, 'gemini')
        pattern = r'```(?:python)?\s*(.*?)```'
        match = re.search(pattern, code, re.DOTALL)
    
        # Extract code from the response.
        if match:
            code = match.group(1)
        else:
            code = "Error: No code found in the response."

        with open("out.txt", "a", encoding='utf-8') as f:
            f.write(code + "\n---\n")   
        snippets.append(code)
    
    print('Generating combined code...')
    combined = generate_combined("\n---\n".join(snippets), 'gemini')
    print('Combined code generated.')

    with open("combined.py", "w", encoding='utf-8') as f:
        f.write(combined)
    # Execute the extracted code in the same scope.
    try:
        global_namespace = {}
        exec(combined, global_namespace)
        global_namespace["MyScene"]().render()
    except Exception as e:
        error_traceback = traceback.format_exc()
        return jsonify({"error": str(e), "traceback": error_traceback}), 500

    video_files = glob.glob("./out/videos/**/MyScene.mp4", recursive=True)
    if not video_files:
        return jsonify({"error": "No video files found."}), 500

    # Specify the bucket name and the file to upload
    bucket_name = 'alpha-tidal-2025'

    object_name = datetime.now().strftime("%Y-%m-%d-%H-%M-%S") + ".mp4"
    # Upload the file
    with open(video_files[0], 'rb') as data:
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