#!/bin/bash
# Start a local web server to avoid CORS issues with ES6 modules
echo "Starting local server at http://localhost:8000"
echo "Press Ctrl+C to stop"
python3 -m http.server 8000
