param(
    [string]$SourceFile = "scripts\installer-src\Installer.cs",
    [string]$ManifestFile = "scripts\installer-src\app.manifest",
    [string]$OutputFile = "public_releases\SmartOrganizer-Setup-1.2.0.exe"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " SMART ORGANIZER - WINDOWS NATIVE INSTALLER COMPILER" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Locate csc.exe in .NET Framework 64-bit
$cscCandidates = @(
    "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
    "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

$cscPath = $null
foreach ($path in $cscCandidates) {
    if (Test-Path $path) {
        $cscPath = $path
        break
    }
}

if (-not $cscPath) {
    Write-Error "Microsoft Visual C# Compiler (csc.exe) not found on system."
    exit 1
}

Write-Host "[1/3] Using C# Compiler: $cscPath" -ForegroundColor Yellow

# Ensure output directory exists
$outDir = Split-Path -Path $OutputFile -Parent
if ($outDir -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$resolvedSource = (Resolve-Path $SourceFile).Path
$resolvedManifest = (Resolve-Path $ManifestFile).Path
$resolvedOutput = (Join-Path (Get-Location) $OutputFile)

Write-Host "[2/3] Compiling Native PE32+ Windows Installer..." -ForegroundColor Yellow
Write-Host "   Source:   $resolvedSource" -ForegroundColor DarkGray
Write-Host "   Manifest: $resolvedManifest" -ForegroundColor DarkGray
Write-Host "   Target:   $resolvedOutput" -ForegroundColor DarkGray

$compilerArgs = @(
    "/nologo",
    "/target:winexe",
    "/platform:x64",
    "/optimize+",
    "/highentropyva+",
    "/win32manifest:`"$resolvedManifest`"",
    "/r:System.dll,System.Windows.Forms.dll,System.Drawing.dll",
    "/out:`"$resolvedOutput`"",
    "`"$resolvedSource`""
)

$process = Start-Process -FilePath $cscPath -ArgumentList $compilerArgs -NoNewWindow -Wait -PassThru

if ($process.ExitCode -ne 0) {
    Write-Error "C# compilation failed with exit code $($process.ExitCode)"
    exit $process.ExitCode
}

Write-Host "[3/3] Validating Compiled Binary..." -ForegroundColor Yellow
$ver = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($resolvedOutput)
$size = (Get-Item $resolvedOutput).Length

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " COMPILATION SUCCESSFUL" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Executable:       $resolvedOutput"
Write-Host " Binary Size:      $size bytes"
Write-Host " Product Name:     $($ver.ProductName)"
Write-Host " Verified Co:      $($ver.CompanyName)"
Write-Host " File Version:     $($ver.FileVersion)"
Write-Host " Description:      $($ver.FileDescription)"
Write-Host " Architecture:     Windows 64-bit (PE32+ GUI Subsystem)"
Write-Host "==========================================================" -ForegroundColor Green
