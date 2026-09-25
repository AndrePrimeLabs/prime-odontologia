Clara Agent (local LLM) - Jetson notes

Overview
This folder runs a small FastAPI wrapper around a ggml-backed LLM using llama-cpp-python. Intended to run on a Palit Pandora Jetson device.

Preconditions on Jetson
- JetPack (matching device) installed via NVIDIA SDK Manager
- nvidia-docker / NVIDIA Container Toolkit installed (nvidia-docker2)
- Adequate disk space for the model (several GB)

How to build (on the Jetson itself)
1. Place a GGML model file in ./models (e.g., ggml-model-q4_0.bin)
2. Build image (CUDA-enabled):
   docker compose -f docker-compose.agent.yml build --build-arg USE_CUDA=1
3. Run:
   docker compose -f docker-compose.agent.yml up -d

If docker compose fails due to CUDA toolchain, build and run manually:
1. Build image on device:
   docker build --build-arg USE_CUDA=0 -t primeos-agent:local -f Dockerfile.agent .
2. Run with GPU (if toolkit available):
   docker run --gpus all -d --network host -v $(pwd)/models:/models \
     -e BACKEND_URL=https://api.primeodontologia.com.br -e PRIMEOS_API_KEY=xxxx \
     --name primeos-agent primeos-agent:local

Notes
- For best performance with CUDA, compile llama.cpp with CUDA support on the device (set USE_CUDA=1) and ensure /usr/local/cuda is available inside the container (nvidia-container-toolkit provides this).
- If building on a separate x86 machine, use docker buildx and push an arm64 image to a registry, then pull on the Jetson.
- Choose a GGML-quantized model compatible with llama.cpp (4-bit quantized recommended for constrained devices).
