# Requisitos del Sistema — CyberLogic Audit

## Requisitos Obligatorios

| Dependencia | Versión Mínima | Descripción | Descarga |
|---|---|---|---|
| **Node.js** | ≥ 18 | Entorno de ejecución para el frontend y backend | https://nodejs.org/ |
| **npm** | ≥ 9 | Gestor de paquetes (incluido con Node.js) | — |
| **SWI-Prolog** | ≥ 9.x | Motor de inferencia lógica para las reglas de detección | https://www.swi-prolog.org/download/stable |

> **Importante:** SWI-Prolog debe instalarse en `C:\Program Files\swipl\bin\swipl.exe` (ruta por defecto en Windows) o en `C:\swipl\bin\swipl.exe`.

## Dependencias npm — Frontend (raíz del proyecto)

| Paquete | Versión |
|---|---|
| `react` | ^19.2.6 |
| `react-dom` | ^19.2.6 |
| `react-router-dom` | ^7.15.1 |
| `zustand` | ^5.0.13 |
| `framer-motion` | ^12.40.0 |
| `recharts` | ^3.8.1 |
| `lucide-react` | ^1.16.0 |
| `@radix-ui/react-dialog` | ^1.1.15 |
| `@radix-ui/react-popover` | ^1.1.15 |
| `@radix-ui/react-progress` | ^1.1.8 |
| `@radix-ui/react-scroll-area` | ^1.2.10 |
| `@radix-ui/react-select` | ^2.2.6 |
| `@radix-ui/react-slot` | ^1.2.4 |
| `@radix-ui/react-tabs` | ^1.1.13 |
| `@radix-ui/react-toast` | ^1.2.15 |
| `@radix-ui/react-tooltip` | ^1.2.8 |
| `tailwindcss` | ^4.3.0 |
| `@tailwindcss/vite` | ^4.3.0 |
| `postcss` | ^8.5.15 |
| `class-variance-authority` | ^0.7.1 |
| `clsx` | ^2.1.1 |
| `@tauri-apps/api` | ^2.11.0 |
| `@tauri-apps/plugin-dialog` | ^2.7.1 |
| `@tauri-apps/plugin-fs` | ^2.5.1 |
| `vite` | ^8.0.12 (dev) |
| `typescript` | ~6.0.2 (dev) |
| `@vitejs/plugin-react` | ^6.0.1 (dev) |
| `@tauri-apps/cli` | ^2.11.2 (dev) |
| `eslint` | ^10.3.0 (dev) |

## Dependencias npm — Backend (`backend/`)

| Paquete | Versión |
|---|---|
| `express` | ^4.18.2 |
| `cors` | ^2.8.5 |
| `multer` | ^1.4.5-lts.1 |
| `csv-parser` | ^3.0.0 |

## Dependencias Rust (opcionales — solo para compilación Tauri)

| Crate | Versión |
|---|---|
| `tauri` | 2 |
| `tauri-plugin-fs` | 2 |
| `tauri-plugin-dialog` | 2 |
| `serde` | 1 (with derive) |
| `serde_json` | 1 |

Requisito adicional: **Rust toolchain** (https://rustup.rs/) solo si se desea compilar la versión de escritorio.

## Instalación Rápida

En PowerShell (como administrador):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

O manualmente:

```powershell
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```
