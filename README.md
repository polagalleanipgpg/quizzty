# Quizzty - Juegos Interactivos Didácticos en Tiempo Real

Una plataforma full-stack para crear quizzes interactivos y conectar con estudiantes en tiempo real mediante códigos QR.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 14 + React + TypeScript |
| **UI** | TailwindCSS + Framer Motion |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **IA** | Google Generative AI (Gemini 1.5 Flash) |
| **Deploy** | Vercel |
| **Estado** | Zustand |
| **Notificaciones** | Sonner |
| **QR** | qrcode |
| **Animaciones** | canvas-confetti |

## ✨ Características

- 🔐 **Autenticación de Profesores** - Registro e inicio de sesión con Supabase Auth
- 📝 **Editor de Quizzes** - Crea preguntas de opción múltiple, verdadero/falso y respuesta corta
- 🤖 **Generación con IA** - Genera preguntas automáticamente describiendo el tema
- 📱 **Conexión con QR** - Estudiantes se unen escaneando QR o ingresando PIN de 6 dígitos
- 🎮 **Juego en Tiempo Real** - Respuestas en vivo con leaderboard que se actualiza instantáneamente
- 🏆 **Ranking y Podio** - Clasificación final con animaciones de confetti
- 🎨 **UI Moderna** - Diseño responsive con animaciones fluidas
- 🔊 **Efectos de Sonido** - Feedback auditivo para acciones del juego
- 📊 **Estadísticas** - Métricas de participación y precisión por pregunta

## 🛠️ Instalación Local

### Prerrequisitos

- Node.js 18+ 
- npm/yarn/pnpm
- Cuenta en Supabase
- (Opcional) API Key de Google Generative AI

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/polagalleanipgpg/quizzty.git
cd quizzty
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_GOOGLE_AI_KEY=tu-google-ai-key-opcional
```

4. **Configurar Supabase**

Ejecuta el schema SQL en tu proyecto Supabase:
- Ve al Dashboard de Supabase → SQL Editor
- Copia el contenido de `supabase/schema.sql`
- Ejecuta el script para crear tablas, triggers y políticas RLS

5. **Habilitar Realtime en Supabase**

En el Dashboard de Supabase:
- Database → Replication
- Habilita realtime para las tablas: `sessions`, `participants`, `answers`, `scores`, `reactions`

6. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
quizzty/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/auth/           # Página de autenticación
│   │   ├── dashboard/          # Dashboard del profesor
│   │   ├── join/               # Página para unirse al juego
│   │   ├── play/[id]/          # Páginas de juego
│   │   ├── teacher/[id]/       # Páginas del profesor (lobby, resultados)
│   │   └── teacher/create/     # Editor de quizzes
│   ├── components/             # Componentes React
│   │   ├── AudioController.tsx
│   │   ├── CircularTimer.tsx
│   │   ├── LandingNav.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── QRDisplay.tsx
│   │   └── FinalPodium.tsx
│   ├── hooks/                  # Custom hooks
│   │   └── useRealtime.ts
│   └── lib/                    # Utilidades y configuración
│       ├── schemas.ts          # Validaciones Zod
│       ├── store.ts            # Zustand store
│       ├── supabase.ts         # Cliente browser
│       └── supabase-server.ts  # Cliente server
├── supabase/
│   └── schema.sql              # Schema de base de datos
├── public/
│   └── manifest.json           # PWA manifest
└── vercel.json                 # Configuración Vercel
```

## 🎮 Modos de Juego

1. **Classic** - Todos contra todos, acumulan puntos
2. **Teams** - Equipos compiten juntos
3. **Elimination** - Últimos lugares son eliminados
4. **Speed** - Más rápido = más puntos

## 🤖 Generación con IA

El editor incluye integración con Google Generative AI para crear preguntas automáticamente:

```typescript
// Ejemplo de prompt
"5 preguntas sobre fracciones para 5to grado de primaria"
```

La IA generará:
- Texto de la pregunta
- Opciones múltiples
- Respuesta correcta
- Tiempo y puntos sugeridos

## 🚀 Deploy en Vercel

1. **Push a GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Conectar en Vercel**
- Ve a [vercel.com](https://vercel.com)
- Importa tu repositorio de GitHub
- Configura las variables de entorno
- Deploy automático

3. **Variables de Entorno en Vercel**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GOOGLE_AI_KEY=...
```

## 📊 Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `teachers` | Profesores (extiende auth.users) |
| `quizzes` | Quizzes creados por profesores |
| `questions` | Preguntas de cada quiz |
| `sessions` | Instancias activas de juego |
| `participants` | Estudiantes en una sesión |
| `answers` | Respuestas de estudiantes |
| `scores` | Puntajes acumulados |
| `reactions` | Emojis en tiempo real |

### Realtime

Las siguientes tablas tienen habilitado Supabase Realtime:
- `sessions` - Cambios de estado del juego
- `participants` - Nuevos jugadores
- `answers` - Respuestas en vivo
- `scores` - Actualización de leaderboard
- `reactions` - Emojis efímeros

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- **Políticas** específicas por rol (profesor/estudiante)
- **Auth** con Supabase Auth (email/password)
- **Validación** de datos con Zod en frontend y backend

## 🎨 Personalización

### Colores de Avatar
Los estudiantes pueden elegir entre 8 colores predefinidos para su avatar.

### Temas
El diseño usa TailwindCSS con colores slate/blue/purple. Para cambiar el tema, edita `tailwind.config.ts`.

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción
npm run start    # Start servidor producción
npm run lint     # ESLint
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit (`git commit -m 'Añadir nueva feature'`)
4. Push (`git push origin feature/nueva-feature`)
5. Pull Request

## 📄 Licencia

MIT License - libre uso educativo y comercial.

## 🙏 Créditos

Hecho con ❤️ para educación.

### Tecnologías
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

**Quizzty** - Aprendiendo jugando, en tiempo real.
