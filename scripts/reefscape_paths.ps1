function Test-DirectoryWritable {
    param([string]$Path)

    if (-not $Path -or -not (Test-Path -LiteralPath $Path)) {
        return $false
    }

    $probe = Join-Path $Path (".reefscape-write-" + [guid]::NewGuid().ToString("n"))
    try {
        New-Item -ItemType File -Path $probe -Force -ErrorAction Stop | Out-Null
        Remove-Item -LiteralPath $probe -Force -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Get-ReefscapeWorkspace {
    param([string]$RepoRoot)

    if (Test-DirectoryWritable $RepoRoot) {
        return (Resolve-Path -LiteralPath $RepoRoot).Path
    }

    $base = $env:LOCALAPPDATA
    if (-not $base) {
        $base = Join-Path $env:USERPROFILE "AppData\Local"
    }
    $workspace = Join-Path $base "Reefscape RL"
    New-Item -ItemType Directory -Force -Path $workspace | Out-Null
    return $workspace
}

function Resolve-ReefscapeVenvPath {
    param(
        [string]$VenvPath = ".venv",
        [string]$RepoRoot
    )

    if (-not $VenvPath) {
        $VenvPath = ".venv"
    }

    $candidate = $VenvPath
    if (-not [System.IO.Path]::IsPathRooted($candidate)) {
        $candidate = Join-Path $RepoRoot $candidate
    }

    $parent = Split-Path -Parent $candidate
    if (Test-DirectoryWritable $parent) {
        return $candidate
    }

    if ($parent -and -not (Test-Path -LiteralPath $parent)) {
        try {
            New-Item -ItemType Directory -Force -Path $parent -ErrorAction Stop | Out-Null
            if (Test-DirectoryWritable $parent) {
                return $candidate
            }
        }
        catch {
        }
    }

    $workspace = Get-ReefscapeWorkspace -RepoRoot $RepoRoot
    $leaf = Split-Path -Leaf $candidate
    if (-not $leaf) {
        $leaf = ".venv"
    }
    $relocated = Join-Path $workspace $leaf
    Write-Host "Cannot create the virtual environment in $parent."
    Write-Host "Using $relocated instead."
    return $relocated
}
