# 🚀 Guía de Inicio Rápido - Quizzty

## ✅ Proyecto Creado Exitosamente

Tu proyecto **Quizzty** está listo en: `c:\Users\josen\Downloads\nuevo\quizzty`

## 📁 Estructura del Proyecto

```
quizzty/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page
│   │   ├── layout.tsx          # Layout principal
│   │   ├── api/auth/           # Autenticación
│   │   ├── dashboard/          # Dashboard profesor
│   │   ├── join/               # Unirse al juego (PIN/QR)
│   │   ├── play/[id]/          # Juego estudiante
│   │   └── teacher/[id]/       # Vista profesor
│   ├── components/             # Componentes React
│   │   ├── Leaderboard.tsx     # Ranking en tiempo real
│   │   ├── QRDisplay.tsx       # Generador QR
│   │   ├── CircularTimer.tsx   # Temporizador
│   │   └── AudioController.tsx # Sonidos
│   ├── hooks/                  # Custom hooks
│   │   └── useRealtime.ts      # Suscripciones Supabase
│   └── lib/                    # Utilidades
│       ├── store.ts            # Zustand (estado global)
│       ├── supabase.ts         # Cliente Supabase
│       └── schemas.ts          # Validaciones Zod
├── supabase/
│   └── schema.sql              # Schema de base de datos
├── .env.local                  # Variables de entorno
├── package.json                # Dependencias
└── README.md                   # Documentación completa
```

## 🎯 Próximos Pasos

### 1. Configurar Supabase (10 minutos)

Sigue las instrucciones en `SUPABASE_SETUP.md`:

```bash
# 1. Crea proyecto en supabase.com
# 2. Copia las credenciales
# 3. Ejecuta el schema SQL en Supabase SQL Editor
# 4. Habilita Realtime para las tablas
```

### 2. Probar Localmente

```bash
cd c:\Users\josen\Downloads\nuevo\quizzty
npm run dev
```

Abre http://localhost:3000

### 3. (Opcional) Configurar IA de Google

Para generación automática de preguntas:

1. Ve a https://makersuite.google.com/app/apikey
2. Crea una API Key gratuita
3. Agrega a `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_AI_KEY=tu-key-aqui
   ```

### 4. Deploy a Vercel

```bash
# 1. Inicializa git
git init
git add .
git commit -m "Initial commit"

# 2. Crea repositorio en GitHub y haz push
git remote add origin https://github.com/tu-usuario/quizzty.git
git push -u origin main

# 3. Deploy en Vercel
# - Ve a vercel.com
# - Importa tu repositorio de GitHub
# - Agrega variables de entorno
# - ¡Deploy automático!
```

## 🎮 Características Implementadas

| Feature | Estado | Descripción |
|---------|--------|-------------|
| 🔐 Auth Profesores | ✅ | Registro/login con email |
| 📝 Editor Quizzes | ✅ | Crea/edita preguntas |
| 🤖 IA Generadora | ✅ | Gemini 1.5 Flash |
| 📱 Conexión QR | ✅ | PIN de 6 dígitos |
| 🎮 Juego Real | ✅ | Multiplayer en tiempo real |
| 🏆 Leaderboard | ✅ | Actualización instantánea |
| 🎉 Podio Final | ✅ | Con confetti |
| 🔊 Sonidos | ✅ | Feedback auditivo |
| 📊 Stats | ✅ | Métricas por pregunta |
| 🎨 UI Moderna | ✅ | Tailwind + Framer Motion |

## 🎯 Flujo de Uso

### Profesor:
1. Registra cuenta → `/api/auth`
2. Dashboard → `/dashboard`
3. Crear quiz → `/teacher/create`
4. Iniciar sesión → `/teacher/[id]/play`
5. Mostrar QR/PIN
6. Comenzar juego
7. Ver resultados → `/teacher/[id]/results`

### Estudiante:
1. Escanea QR o va a `/join`
2. Ingresa PIN (6 dígitos)
3. Elige nickname y avatar
4. Juega → `/play/[id]/question`
5. Ve ranking en vivo

## 🔧 Comandos Disponibles

```bash
npm run dev      # Desarrollo (http://localhost:3000)
npm run build    # Build producción
npm run start    # Start producción
npm run lint     # ESLint (con errores permitidos)
```

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: TailwindCSS, Framer Motion, Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Estado**: Zustand
- **IA**: Google Generative AI
- **QR**: qrcode
- **Notificaciones**: Sonner
- **Animaciones**: canvas-confetti
- **Deploy**: Vercel

## 📊 Base de Datos

Tablas creadas en Supabase:
- `teachers` - Profesores
- `quizzes` - Quizzes
- `questions` - Preguntas
- `sessions` - Sesiones activas
- `participants` - Estudiantes
- `answers` - Respuestas
- `scores` - Puntajes
- `reactions` - Emojis

## 🔒 Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_GOOGLE_AI_KEY=opcional
```

## 🎨 Personalización

### Colores
Edita `tailwind.config.ts` para cambiar la paleta.

### Fuentes
El proyecto usa Inter font de Google Fonts.

### Sonidos
Agrega archivos `.mp3` en `public/sounds/`:
- `join.mp3` - Al unirse
- `correct.mp3` - Respuesta correcta
- `wrong.mp3` - Respuesta incorrecta
- `podium.mp3` - Podio final
- `countdown.mp3` - Cuenta regresiva

## 🐛 Solución de Problemas

### "No se puede conectar a Supabase"
- Verifica `.env.local`
- Reinicia `npm run dev`

### "Error de autenticación"
- Verifica Auth en Supabase
- Revisa políticas RLS

### "Realtime no funciona"
- Habilita Replication en Supabase
- Verifica suscripciones en el código

## 📞 Soporte

- **Documentación**: `README.md`
- **Setup Supabase**: `SUPABASE_SETUP.md`
- **Issues**: GitHub del proyecto

## 🎉 ¡Listo!

Tu plataforma de juegos didácticos en tiempo real está completa.

**Prueba el flujo completo:**
1. Abre http://localhost:3000
2. Registra una cuenta
3. Crea un quiz (usa IA para probar)
4. Inicia una sesión
5. Abre otra pestaña en modo incógnito
6. Únete con el PIN
7. ¡Comienza el juego!

---

**Hecho con ❤️ para educación**

Quizzty - Aprendiendo jugando, en tiempo real.
