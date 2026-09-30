# Container for Hugging Face Spaces (Docker SDK) or any cloud that runs Docker.
FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public

# Hugging Face Spaces expects the app on port 7860.
ENV PORT=7860 \
    DTYPE=q8 \
    MODEL_CACHE_DIR=/tmp/model-cache \
    MODEL_ID=your-username/dialogue-summarizer-onnx

EXPOSE 7860
CMD ["node", "src/server.js"]
