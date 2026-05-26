**Sistema de Monitoreo de Ciberseguridad con Motor de Inferencia Prolog**

Aplicación full-stack desarrollada para una materia de la universidad que permite analizar logs de acceso mediante un motor de reglas lógicas escrito en Prolog. 
No era necesario utilizar tauri pero me gusta y queria usarlo.

---

## Arquitectura

```
┌──────────────────────────────────────────────────┐
│  Frontend (React 19 + TypeScript + Vite)         │
│  - Dashboard con charts interactivos             │
│  - Visor de logs con filtros y paginación        │
│  - Centro de alertas clasificables               │
│  - Gestión de blacklist de IPs                   │
│  - Generación de reportes                        │
│  - Estado global con Zustand                     │
├──────────────────────────────────────────────────┤
│  Backend (Node.js + Express)                     │
│  - API REST en puerto 3001                       │
│  - Parsea archivos CSV → hechos Prolog           │
│  - Ejecuta consultas en SWI-Prolog               │
│  - Devuelve resultados estructurados en JSON     │
├──────────────────────────────────────────────────┤
│  Motor de Inferencia (SWI-Prolog)                │
│  - Base de conocimiento estática (roles,         │
│    blacklist, subredes)                          │
│  - 13 reglas de detección de amenazas            │
│  - Generación de alertas con niveles de          │
│    severidad (crítica, alta, media)              │
├──────────────────────────────────────────────────┤
│  Shell de Escritorio (Tauri + Rust) [Opcional]   │
│  - Ventana nativa 1440×900                       │
│  - Diálogos de archivo nativos                   │
│  - Acceso al sistema de archivos                 │
└──────────────────────────────────────────────────┘
```

---

## Características

- **Dashboard** con estadísticas en tiempo real y gráficos (actividad por hora, distribución de severidad, tipos de ataque)
- **Carga de logs CSV** con validación automática de columnas
- **13 reglas de detección** que cubren fuerza bruta, accesos maliciosos, ataques coordinados, accesos fuera de horario, y más
- **Centro de alertas** con filtros por severidad, estado y tipo de regla
- **Clasificación de alertas** como seguras o peligrosas
- **Gestión de blacklist** de IPs con exportación a CSV
- **Generación de reportes** en texto plano
- **Modo oscuro** con diseño moderno y animaciones
- **Disponible como aplicación web y de escritorio** (Tauri)

---

## Requisitos Previos

Ver [REQUIREMENTS.md](./REQUIREMENTS.md) para la lista completa de dependencias.

Resumen:
- **Node.js** ≥ 18
- **npm** ≥ 9
- **SWI-Prolog** ≥ 9.x (instalado en `C:\Program Files\swipl\bin\swipl.exe`)
- **Rust toolchain** (opcional, solo para compilar versión Tauri)

---

## Instalación

### Automática (Windows)

```powershell
.\setup.ps1
```

### Manual

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

---

## Inicio Rápido

### 1. Iniciar el backend

```bash
cd backend
npm start
```

El backend se ejecutará en `http://localhost:3001`.

### 2. Iniciar el frontend (en otra terminal)

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:1420`.

### 3. Modo escritorio (Tauri)

```bash
npm run tauri dev
```

---

## Cómo Usar

1. **Cargar un archivo CSV**: Haz clic en "Cargar CSV" en la barra superior. El CSV debe contener las columnas: `timestamp, usuario, ip, estado, hora, puerto, pais`. Puedes usar el archivo de ejemplo en `backend/sample.csv`.

2. **Explorar el Dashboard**: Una vez cargado el CSV, el dashboard mostrará estadísticas, gráficos y las alertas activas generadas por el motor Prolog.

3. **Revisar Alertas**: Ve a la sección "Alertas" para ver todas las detecciones. Cada alerta muestra la regla que se disparó, su severidad, y permite clasificarla como segura o peligrosa.

4. **Gestionar Blacklist**: En la sección "Blacklist" puedes añadir IPs manualmente. El sistema detectará automáticamente accesos desde IPs blacklisteadas.

5. **Generar Reportes**: En la sección "Reportes" puedes generar informes de seguridad en formato texto con el resumen de todas las detecciones.

---

## Reglas de Detección

| Regla | Severidad | Descripción |
|---|---|---|
| `fuerza_bruta` | **Crítica** | ≥3 intentos fallidos de inicio de sesión por un mismo usuario |
| `intrusion_probable` | **Crítica** | Fuerza bruta seguida de un acceso exitoso |
| `ataque_coordinado` | **Crítica** | ≥5 intentos fallidos desde un mismo país |
| `admin_fuera_horario` | Alta | Admin con acceso exitoso fuera del horario laboral (8:00–18:00) |
| `acceso_simultaneo` | Alta | Mismo usuario accediendo desde distintas subredes |
| `solo_fallos` | Alta | Usuario con solo intentos fallidos, ningún éxito |
| `ataque_ip` | Alta | ≥5 intentos fallidos desde una misma IP |
| `acceso_malicioso` | Media | Usuario accede desde una IP blacklistada |
| `multiples_paises` | Media | Usuario accede desde ≥2 países distintos |
| `usuario_sospechoso` | Compuesta | Fuerza bruta, país sospechoso o puerto peligroso |
| `evento_critico` | Compuesta | Admin fuera de horario, usuario crítico o ataque+malicioso |
| `usuario_critico` | Compuesta | Intrusión probable + múltiples IPs + acceso malicioso |
| `multiples_ips` | Subregla | Usuario con accesos exitosos desde distintas IPs |

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo Vite (puerto 1420) |
| `npm run build` | Compila TypeScript y construye la app para producción |
| `npm run lint` | Ejecuta ESLint sobre el código |
| `npm run preview` | Vista previa de la build de producción |
| `npm run tauri dev` | Inicia la aplicación de escritorio con Tauri |
| `npm run tauri build` | Compila el instalador de escritorio |
| `cd backend && npm start` | Inicia el servidor backend (puerto 3001) |
| `cd backend && npm run dev` | Inicia el backend con recarga automática |

---

## Tecnologías

- **Frontend**: React 19, TypeScript 6, Vite 8, Zustand 5, Framer Motion 12, Recharts 3, Tailwind CSS 4, Radix UI, Lucide React
- **Backend**: Node.js, Express 4, Multer, csv-parser
- **Motor Lógico**: SWI-Prolog
- **Escritorio**: Tauri 2, Rust
- **Edición**: VS Code, ESLint

---

## Licencia

Uso académico y educativo.
