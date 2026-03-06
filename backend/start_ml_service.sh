#!/bin/bash
echo "Starting ML Service..."
cd ml
export PYTHONNOUSERSITE=1
if [ -x "../../ml_env/bin/python3" ]; then
  ../../ml_env/bin/python3 -s ml_service.py
else
  python3 -s ml_service.py
fi
