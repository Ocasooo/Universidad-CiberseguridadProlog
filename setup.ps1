# CyberLogic Audit — Script de instalación para Windows
# Requiere PowerShell 5.1 o superior

$ErrorActionPreference = "Stop"
$host.UI.RawUI.WindowTitle = "CyberLogic Audit — Instalación"

function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
    $color = switch ($Status) {
        "OK"    { "Green" }
        "FAIL"  { "Red" }
        "WARN"  { "Yellow" }
        "SKIP"  { "DarkYellow" }
        default { "Cyan" }
    }
    Write-Host ("[{0}] {1}" -f $Status.PadRight(4), $Message) -ForegroundColor $color
}

function Test-Command($Command) {
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# --- 1. Verificar Node.js ---
Write-Step "Verificando Node.js..." "INFO"
if (Test-Command "node") {
    $nodeVer = node --version
    Write-Step "Node.js detectado: $nodeVer" "OK"
} else {
    Write-Step "Node.js no encontrado. Descárgalo de https://nodejs.org/" "FAIL"
    Write-Step "Una vez instalado, ejecuta este script nuevamente." "WARN"
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- 2. Verificar npm ---
Write-Step "Verificando npm..." "INFO"
if (Test-Command "npm") {
    $npmVer = npm --version
    Write-Step "npm detectado: v$npmVer" "OK"
} else {
    Write-Step "npm no encontrado. Asegúrate de que Node.js se instaló correctamente." "FAIL"
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- 3. Verificar SWI-Prolog ---
Write-Step "Verificando SWI-Prolog..." "INFO"
$swiPaths = @(
    "C:\Program Files\swipl\bin\swipl.exe",
    "C:\swipl\bin\swipl.exe"
)
$swiplFound = $false
foreach ($path in $swiPaths) {
    if (Test-Path -LiteralPath $path) {
        Write-Step "SWI-Prolog detectado en: $path" "OK"
        $swiplFound = $true
        break
    }
}
if (-not $swiplFound) {
    Write-Step "SWI-Prolog no encontrado en las rutas comunes." "WARN"
    Write-Step "Descárgalo e instálalo desde: https://www.swi-prolog.org/download/stable" "WARN"
    Write-Step "Ruta esperada: C:\Program Files\swipl\bin\swipl.exe" "WARN"
    $choice = Read-Host "¿Deseas continuar igualmente? (s/N)"
    if ($choice -ne "s" -and $choice -ne "S") {
        exit 1
    }
}

# --- 4. Instalar dependencias del frontend ---
Write-Step "Instalando dependencias del frontend (npm install)..." "INFO"
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install falló" }
    Write-Step "Dependencias del frontend instaladas correctamente." "OK"
} catch {
    Write-Step "Error al instalar dependencias del frontend: $_" "FAIL"
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- 5. Instalar dependencias del backend ---
Write-Step "Instalando dependencias del backend (npm install)..." "INFO"
try {
    Push-Location -LiteralPath "backend"
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install falló" }
    Pop-Location
    Write-Step "Dependencias del backend instaladas correctamente." "OK"
} catch {
    Pop-Location
    Write-Step "Error al instalar dependencias del backend: $_" "FAIL"
    Read-Host "Presiona Enter para salir"
    exit 1
}

# --- 6. Resumen final ---
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   CyberLogic Audit — Instalación completada         ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║   Para iniciar el proyecto:                        ║" -ForegroundColor Green
Write-Host "║                                                    ║" -ForegroundColor Green
Write-Host "║   1. Inicia el backend:                            ║" -ForegroundColor Green
Write-Host "║      cd backend                                    ║" -ForegroundColor Green
Write-Host "║      npm start                                     ║" -ForegroundColor Green
Write-Host "║                                                    ║" -ForegroundColor Green
Write-Host "║   2. En otra terminal, inicia el frontend:          ║" -ForegroundColor Green
Write-Host "║      npm run dev                                   ║" -ForegroundColor Green
Write-Host "║                                                    ║" -ForegroundColor Green
Write-Host "║   3. Abre en tu navegador:                         ║" -ForegroundColor Green
Write-Host "║      http://localhost:1420                         ║" -ForegroundColor Green
Write-Host "║                                                    ║" -ForegroundColor Green
Write-Host "║   Para modo escritorio (Tauri):                    ║" -ForegroundColor Green
Write-Host "║      npm run tauri dev                             ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Read-Host "Presiona Enter para cerrar"
