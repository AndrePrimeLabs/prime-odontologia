#!/usr/bin/env bash
set -euo pipefail

# download_model.sh
# Usage: ./download_model.sh <MODEL_URL> [output-filename]
# Example: ./download_model.sh "https://example.com/path/to/ggml-model.bin" ggml-model-q4.bin
# This script downloads a model into ./models and verifies basic sanity.

OUT_DIR="$(pwd)/models"
mkdir -p "$OUT_DIR"

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <MODEL_URL> [output-filename]"
  exit 1
fi

MODEL_URL="$1"
OUTNAME="${2:-$(basename "$MODEL_URL")}" 
OUTPATH="$OUT_DIR/$OUTNAME"

echo "Downloading model from: $MODEL_URL"

# Use curl with a resume flag and show progress
curl -L --retry 5 --retry-delay 5 --fail -o "$OUTPATH" "$MODEL_URL"

echo "Downloaded to $OUTPATH"

# Basic sanity checks
filesize=$(stat -c%s "$OUTPATH" 2>/dev/null || stat -f%z "$OUTPATH")
if [ "$filesize" -lt 1048576 ]; then
  echo "Warning: downloaded file is smaller than 1MB ($filesize bytes). Confirm this is the expected model file." >&2
fi

# List models directory
echo "Models directory contents:" 
ls -lh "$OUT_DIR"

echo "Done. To run the agent, make sure the model path matches MODEL_PATH or MODEL_PATH env var (default /models/ggml-model.bin)."

echo "Notes:"
echo " - If your model is hosted on Hugging Face and requires authentication, use 'huggingface-cli' or provide an access token."
echo " - For large model downloads, ensure you have enough disk space and a stable connection."

exit 0
