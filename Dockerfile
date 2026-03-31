# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Stage 2: Build Backend and Final Image
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies required for psutil and docker handling if needed
RUN apt-get update && apt-get install -y gcc python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend ./backend

# Copy built frontend from Stage 1 into the location expected by Flask
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the Flask port
EXPOSE 5000

# Set up environment variables
ENV PYTHONUNBUFFERED=1

# Run the flask application from the backend directory
WORKDIR /app/backend
CMD ["python", "run.py", "--no-reload"]
