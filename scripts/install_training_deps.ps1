param(
    [string]$VenvPath = ".venv"
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

. (Join-Path $PSScriptRoot "reefscape_paths.ps1")
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$VenvPath = Resolve-ReefscapeVenvPath -VenvPath $VenvPath -RepoRoot $repoRoot
$requirements = Join-Path $repoRoot "requirements.txt"

function Show-DependencyProgress {
    param(
        [string]$Status,
        [int]$Step
    )

    Write-Progress `
        -Activity "Training dependency setup" `
        -Status $Status `
        -PercentComplete ([math]::Min(100, [math]::Max(0, (($Step - 1) * 100 / 3))))
    Write-Host "[$Step/3] $Status"
}

Show-DependencyProgress "Checking virtual environment" 1
$venvPython = Join-Path $VenvPath "Scripts\python.exe"
if (-not (Test-Path -LiteralPath $venvPython)) {
    throw "Virtual environment was not found at $VenvPath. Run setup first."
}

Show-DependencyProgress "Upgrading pip" 2
Write-Host "Upgrading pip"
& $venvPython -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) {
    throw "pip upgrade failed with exit code $LASTEXITCODE."
}

Show-DependencyProgress "Installing CUDA/training requirements" 3
Write-Host "Installing CUDA/training requirements. This can take a while."
& $venvPython -m pip install -r $requirements
if ($LASTEXITCODE -ne 0) {
    throw "requirements install failed with exit code $LASTEXITCODE."
}

Write-Progress -Activity "Training dependency setup" -Completed
Write-Host ""
Write-Host "Training dependencies installed."
