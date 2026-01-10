# python-service

This is the FastAPI microservice used by the app for frame analysis.

Start development server (PowerShell):

```powershell
# activate venv (if not already active)
.\venv\Scripts\Activate

# run uvicorn directly
uvicorn main:app --reload --port 8000
```

You can also run with npm (this runs the helper PowerShell script):

```powershell
npm run dev
```

Notes:
- The service requires the Python virtual environment and dependencies installed in `venv`.
 - The service requires the Python virtual environment and dependencies installed in `venv`.
	 We added a `requirements.txt` listing the key packages. The helper script `run_dev.ps1` will
	 attempt to install those into the venv automatically (using `pip install -r requirements.txt`).
- The API endpoint for frame analysis is POST /analyze (JSON body: { image: '<base64 data>' }).
