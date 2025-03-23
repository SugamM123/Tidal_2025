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
from system import gen_steps, gen_code
from debug import debug_code
import traceback

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

def generate_steps(prompt):
    response = openai.ChatCompletion.create(
        model="o3-mini",
        messages=[
            {"role": "system", "content": gen_steps},
            {"role": "user", "content": prompt}
        ]
    )
    return (response['choices'][0]['message']['content'])

def generate_code(steps):
    response = openai.ChatCompletion.create(
        model="o3-mini",
        messages=[
            {"role": "system", "content": gen_code},
            {"role": "user", "content": steps}
        ]
    )
    return (response['choices'][0]['message']['content'])
app = Flask(__name__)
# Update to allow localhost during development
CORS(app, origins=["https://tidal-2025.pages.dev"])

# Enable CORS for all routes
# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
#     return response

@app.route('/run', methods=['GET'])
def run_code():
    prompt = request.args.get('prompt')
    if not prompt:
        return jsonify({"error": "Prompt parameter is missing."}), 400

    print('generating steps')
    steps = generate_steps(prompt)
    with open('steps.txt', 'w') as f:
        f.write(steps)
    print('generating code')
    code = generate_code(steps)
    with open('code.txt', 'w') as f:
        f.write(code)
    pattern = r'```(?:python)?\s*(.*?)```'
    match = re.search(pattern, code, re.DOTALL)
    
    # Extract code from the response.
    if match:
        code = match.group(1)
    else:
        code = "Error: No code found in the response."

    print('Executing code')
    succeeded = False
    for attempt in range(4):
        try:
            global_namespace = {}
            exec(code, global_namespace)
            global_namespace["MyScene"]().render()
            succeeded = True  # mark that the execution succeeded
            break
        except Exception as e:
            error_traceback = traceback.format_exc()
            print(error_traceback)
            print(f"Error {attempt+1}: attempting to debug the code...")
            code = debug_code(code, error_traceback)

    if not succeeded:
        error_traceback = traceback.format_exc()
        return jsonify({"error": "error"}), 500

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


@app.route('/list_videos', methods=['GET'])
def list_videos():
    bucket_name = 'alpha-tidal-2025'
    
    try:
        # Use the same S3 client instance as the successful /run endpoint
        # No need to recheck credentials since /run works
        
        # List all objects in the bucket directly, like in /run
        response = s3.list_objects_v2(Bucket=bucket_name)
        
        if 'Contents' not in response:
            return jsonify({"videos": []})
        
        # Extract file names and generate pre-signed URLs with same pattern as /run
        videos = []
        for obj in response['Contents']:
            key = obj['Key']
            if key.endswith('.mp4'):  # Filter for video files
                # Generate URL with same params as the working /run endpoint
                url = s3.generate_presigned_url(
                    ClientMethod='get_object',
                    Params={'Bucket': bucket_name, 'Key': key},
                    ExpiresIn=None  # Match the /run endpoint which uses no expiry
                )
                
                videos.append({
                    "key": key,
                    "size": obj['Size'],
                    "last_modified": obj['LastModified'].strftime('%Y-%m-%d %H:%M:%S'),
                    "url": url
                })
        
        # Return results
        return jsonify({"videos": videos})
    except Exception as e:
        return jsonify({"error": f"Failed to list videos: {str(e)}"}), 500

# @app.route('/api/welcome')
# def home():
#     return jsonify(message="SUP")

if __name__ == '__main__':
    # Use the PORT environment variable provided by Render
    port = int(os.environ.get("PORT", 1000))
    app.run(host="0.0.0.0", port=port)