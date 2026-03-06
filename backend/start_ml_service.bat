@echo off
echo Starting ML Service...
set PYTHONNOUSERSITE=1
cd ml
if exist ..\..\ml_env\Scripts\python.exe (
  ..\..\ml_env\Scripts\python.exe -s ml_service.py
) else (
  python -s ml_service.py
)
pause

