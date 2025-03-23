# Use the official Python image as the base image
FROM python:3.11-slim-buster

# copy backend files to the container
COPY . /app

# apt update and upgrade
RUN apt-get update && apt-get upgrade -y

# install other deps
RUN apt-get install -y texlive-full

# install tinytex

# Update and install system dependencies
RUN apt-get install -y \
    wget \
    ffmpeg \
    libcairo2-dev \
    pkg-config \
    python3-dev \
    build-essential \
    libpango1.0-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create and activate virtual environment
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Install Python packages
RUN pip install --no-cache-dir manim flask

# CMD sleep infinity
# CMD ["python", "app.py"]

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt