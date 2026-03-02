# 📋 Configuración de Supabase para Quizzty

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita si no tienes una
3. Click en "New Project"
4. Completa los datos:
   - **Name**: quizzty
   - **Database Password**: (guarda esta contraseña)
   - **Region**: elige la más cercana (us-east-1 para EE.UU./Latinoamérica)
5. Espera a que se cree el proyecto (~2 minutos)

## Paso 2: Obtener Credenciales

1. En el Dashboard de tu proyecto, ve a **Settings** → **API**
2. Copia las siguientes credenciales:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (clave pública para el frontend)
   - **service_role key**: `eyJhbGc...` (clave secreta, NO compartir)

## Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-completa
NEXT_PUBLIC_GOOGLE_AI_KEY=opcional-para-ia
```

## Paso 4: Ejecutar Schema SQL

1. En Supabase Dashboard, ve a **SQL Editor**
2. Click en "New Query"
3. Copia TODO el contenido de `supabase/schema.sql`
4. Pega en el editor
5. Click en "Run" o presiona Ctrl+Enter

Deberías ver mensajes de éxito como:
- `CREATE TABLE`
- `CREATE FUNCTION`
- `CREATE TRIGGER`
- `ALTER PUBLICATION`

## Paso 5: Habilitar Realtime

1. Ve a **Database** → **Replication**
2. Habilita realtime para las siguientes tablas (toggle):
   - ✅ `sessions`
   - ✅ `participants`
   - ✅ `answers`
   - ✅ `scores`
   - ✅ `reactions`

## Paso 6: Configurar Auth (Email)

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. Opcional: Configura confirmación de email o deshabilítala para desarrollo:
   - **Authentication** → **Settings** → **Email Auth**
   - Desmarca "Enable email confirmations" para testing

## Paso 7: Verificar Instalación

Ejecuta estas consultas en el SQL Editor para verificar:

```sql
-- Ver tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Ver triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Ver funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

## Paso 8: (Opcional) Configurar Google AI para Generación de Preguntas

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una API Key gratuita
3. Agrega a `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_AI_KEY=tu-google-ai-key
```

Sin esta key, la función de IA no estará disponible, pero el resto del proyecto funcionará normalmente.

## Paso 9: Probar Localmente

```bash
npm run dev
```

Abre http://localhost:3000 y:
1. Registra una cuenta de profesor
2. Crea un quiz
3. Inicia una sesión
4. Abre otra pestaña/anónimo y únete con el PIN

## 🐛 Solución de Problemas

### Error: "Invalid API key"
- Verifica que las credenciales en `.env.local` sean correctas
- Reinicia el servidor de desarrollo

### Error: "Row-level security policy violation"
- Verifica que el schema SQL se ejecutó completamente
- Revisa que las políticas RLS estén creadas

### Error: "Realtime not working"
- Asegúrate de haber habilitado las tablas en Database → Replication
- Verifica que el canal de suscripción esté activo en el navegador

### Error: "Email not sending"
- En desarrollo, usa el modo "Magic Link" o deshabilita confirmación de email
- En producción, configura SMTP en Supabase

## 📊 Estructura de la Base de Datos

```
teachers ──< quizzes >── questions
              │
              └──< sessions >── participants >── answers
                                   │              │
                                   └──> scores <──┘
                                   │
                                   └──> reactions
```

## 🔒 Seguridad

Las políticas RLS aseguran que:
- Solo el profesor puede editar sus quizzes
- Cualquiera puede unirse a una sesión activa
- Los estudiantes solo ven datos de su sesión
- Los scores se actualizan automáticamente vía triggers

## 🚀 Deploy a Vercel

1. Push a GitHub
2. Importa en Vercel
3. Agrega las mismas variables de entorno
4. Deploy automático

---

**¡Listo!** Tu backend de Supabase está configurado.
