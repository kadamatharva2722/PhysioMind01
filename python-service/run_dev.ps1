# Run development server for python-service (Windows PowerShell)
# Activates the local venv and runs uvicorn on port 8000
$venvRoot = Join-Path $PSScriptRoot 'venv'
$venvScripts = Join-Path $venvRoot 'Scripts'
$python = Join-Path $venvScripts 'python.exe'

function Create-VenvIfMissing {
  param([string]$venvPath)

  if (-Not (Test-Path $venvPath)) {
    Write-Host 'Virtual environment not found — creating venv at:' $venvPath

    # Prefer the py launcher for Windows and try specific Python versions (3.11, 3.10...) which
    # have wider wheel support for packages like mediapipe. Fall back to `py -3` then to `python`.
    if (Get-Command py -ErrorAction SilentlyContinue) {
      $tried = $false
      foreach ($ver in @('3.11','3.10','3.9','3.8')) {
        try {
          Write-Host "Attempting to create venv using py -$ver"
          & py -$ver -m venv $venvPath
          # after creation, check the created python, and ensure its version matches the requested one
          $candidatePython = Join-Path $venvPath 'Scripts\python.exe'
          if (Test-Path $candidatePython) {
            $createdVersion = & $candidatePython --version 2>&1
            if ($LASTEXITCODE -eq 0 -and $createdVersion -match $ver) {
              Write-Host "Successfully created venv using py -$ver ($createdVersion)"
              $tried = $true
              break
            } else {
              Write-Host "Creation with py -$ver didn't produce expected Python version ($createdVersion), trying next"
              Remove-Item -Recurse -Force $venvPath -ErrorAction SilentlyContinue
            }
          }
        } catch {
          # ignore and try next version
          Remove-Item -Recurse -Force $venvPath -ErrorAction SilentlyContinue
        }
      }
      if (-Not $tried) { Write-Host 'No specific py -3.X found; using py -3'; & py -3 -m venv $venvPath }
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
      & python -m venv $venvPath
    } else {
      Write-Error 'No Python interpreter found. Please install Python 3.x and ensure "py" or "python" is available on PATH.'
      exit 1
    }
  }
}

Create-VenvIfMissing -venvPath $venvRoot

# If python exists, verify that it runs correctly. Some pip/python launchers are small wrappers that
# can contain embedded absolute paths to a different machine's python (leaving a broken venv). If
# the venv's python invocation fails, recreate the venv from scratch.
function Test-And-RecreateVenvIfBroken {
  param([string]$pythonPath, [string]$venvPath)

  if (Test-Path $pythonPath) {
    $output = & $pythonPath --version 2>&1
    if ($LASTEXITCODE -ne 0 -or ($output -match 'No Python at')) {
      Write-Host "Detected broken venv python ($output). Rebuilding venv..."
      Remove-Item -Recurse -Force $venvPath
      Create-VenvIfMissing -venvPath $venvPath
    }
  }
}

Test-And-RecreateVenvIfBroken -pythonPath $python -venvPath $venvRoot

if (-Not (Test-Path $python)) {
  Write-Error 'After creating the venv I could not find python.exe at' $python
  Write-Error 'Something went wrong with venv creation.'
  exit 1
}

# Use the venv python to run pip (avoid calling pip.exe directly because it may contain stale absolute paths)
if (Test-Path (Join-Path $PSScriptRoot 'requirements.txt')) {
  Write-Host "Installing Python requirements into venv (this may take a few moments)..."
  & $python -m pip install --upgrade pip
  $reqPath = (Join-Path $PSScriptRoot 'requirements.txt')
  $installOutput = & $python -m pip install -r $reqPath 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host $installOutput
    # If mediapipe failed because of Python version, attempt to fallback to a compatible Python (3.10) if available.
    if ($installOutput -match 'No matching distribution found for mediapipe') {
      Write-Host "mediapipe not available for this Python version. Trying to recreate the venv with Python 3.10 (if available)"
      if (Get-Command py -ErrorAction SilentlyContinue) {
        try {
          & py -3.10 --version > $null 2>&1
          Write-Host 'Creating venv using py -3.10 for mediapipe compatibility'
          Remove-Item -Recurse -Force $venvRoot -ErrorAction SilentlyContinue
          & py -3.10 -m venv $venvRoot
          $python = Join-Path $venvScripts 'python.exe'
          if (-Not (Test-Path $python)) {
            Write-Error 'Failed to create venv using Python 3.10.'
            exit 1
          }
          Write-Host "Re-running pip install inside recreated venv (Python: $( & $python --version 2>&1 ))"
          & $python -m pip install --upgrade pip
          & $python -m pip install -r $reqPath
        } catch {
          Write-Error 'Could not recreate venv using py -3.10. Please install an appropriate Python 3.10/3.11 runtime and re-run this script.'
          exit 1
        }
      } else {
        Write-Error 'py launcher not found; please install Python 3.10 or 3.11 and add it to PATH.'
        exit 1
      }
    } else {
      Write-Error 'pip install failed. See output above for details.'
      exit 1
    }
  }
}

Write-Host 'Starting uvicorn (port 8000) in venv using' $python
& $python -m uvicorn main:app --reload --port 8000
