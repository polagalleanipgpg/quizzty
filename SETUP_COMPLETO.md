# 🚀 GUÍA COMPLETA DE CONFIGURACIÓN - QUIZZTY

## ⚠️ EJECUTAR EN ORDEN - IMPORTANTE

---

## 📋 PASO 1: Optimizar RLS Policies (5 minutos)

### ¿Por qué?
Los warnings que ves son de PERFORMANCE. No impiden que funcione, pero es mejor optimizar.

### ¿Cómo?

1. Abrí: https://supabase.com/dashboard/project/ejbwehcaylbuymvchodv/sql/new

2. Copiá TODO el contenido de: `supabase/optimize_rls_policies.sql`

3. Pegalo en el editor SQL

4. Click en **RUN** (o Ctrl+Enter)

5. Deberías ver: `✅ Success. No rows returned`

---

## 📋 PASO 2: Fix para Quizzes que no se guardan (3 minutos)

### ¿Por qué?
Si los quizzes no se ven en el dashboard, es por las políticas RLS.

### ¿Cómo?

1. En el mismo SQL Editor de Supabase

2. Copiá TODO el contenido de: `supabase/fix_quizzes_policy.sql`

3. Pegalo y ejecutalo

4. Verificá que se crearon 2 políticas para `quizzes`

---

## 📋 PASO 3: Verificar en la App (2 minutos)

### Test de Quizzes:

1. Abrí: http://localhost:3000/dashboard

2. Presioná **Ctrl+Shift+R** (hard refresh)

3. Si no hay quizzes, usá el botón **"🧪 Crear Quiz de Test"**

4. Debería aparecer el quiz creado

### Test de Crear Quiz:

1. Andá a: http://localhost:3000/teacher/create

2. Completá:
   - Título: "Mi Quiz de Prueba"
   - Descripción: "Test"
   - Materia: "General"

3. Click en **"Guardar"**

4. Volvé al Dashboard

5. ¡Debería aparecer tu quiz!

---

## 📋 PASO 4: Test de IA (Google AI Studio) (3 minutos)

### Si la IA no funciona:

1. Verificá la API Key en Vercel:
   - https://vercel.com/dashboard
   - Tu proyecto → Settings → Environment Variables
   - `NEXT_PUBLIC_GOOGLE_AI_KEY` = `AIzaSyA5GuP7SmdBvHzEIG_h55JoTrAIsYzMfuI`

2. Si dice "límite alcanzado":
   - Creá nueva key en: https://makersuite.google.com/app/apikey
   - Actualizá en Vercel
   - Redeploy

3. Test:
   - Andá a `/teacher/create`
   - Click en "IA"
   - Escribí: "preguntas sobre animales"
   - Click "Generar"
   - ¡Debería crear 5 preguntas!

---

## 📋 PASO 5: Test de QR y Lobby (2 minutos)

### Ver el QR:

1. En el Dashboard, click en **"Jugar"** en un quiz

2. Debería aparecer el **QR automáticamente** (ya está fixeado)

3. El PIN de 6 dígitos debería verse grande

4. Click en **"Copiar Enlace"** para probar

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### ❌ "No tienes quizzes aún"

**Solución:**
```
1. Usá el botón "🧪 Crear Quiz de Test"
2. Si falla, revisá la consola (F12)
3. Si dice error de RLS, ejecutá PASO 2
```

### ❌ "infinite recursion detected in policy"

**Solución:**
```
1. Ejecutá PASO 1 (optimize_rls_policies.sql)
2. Recargá el dashboard
```

### ❌ La IA no genera preguntas

**Solución:**
```
1. Verificá logs en consola (F12)
2. Si dice "403" → API Key inválida
3. Si dice "429" → Límite alcanzado (creá otra key)
4. Si dice "404" → Modelo no existe (ya está fixeado)
```

### ❌ QR no se muestra

**Solución:**
```
1. Ya está fixeado para mostrarse por defecto
2. Si no se ve, click en "Mostrar QR"
3. Hard refresh (Ctrl+Shift+R)
```

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ Implementado:
- [x] Autenticación de profesores
- [x] Dashboard de quizzes
- [x] Editor de preguntas (manual + IA)
- [x] Sistema de QR y PIN
- [x] Lobby de espera
- [x] Juego en tiempo real
- [x] Leaderboard en vivo
- [x] Podio final
- [x] Múltiples modos de juego (Clásico, Blitz, Equipos, Eliminación)
- [x] Onboarding interactivo
- [x] Sistema de logros/medallas
- [x] Loading skeletons
- [x] Atajos de teclado
- [x] Retry logic para IA

### 🚧 En progreso:
- [ ] Exportar resultados a Excel
- [ ] Dashboard de analytics
- [ ] Responsive móvil mejorado

### 💡 Próximas features:
- [ ] Banco de preguntas compartido
- [ ] Integración con Google Classroom
- [ ] App móvil

---

## 🔗 LINKS ÚTILES

| Recurso | Link |
|---------|------|
| **Supabase Dashboard** | https://supabase.com/dashboard/project/ejbwehcaylbuymvchodv |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Google AI Studio** | https://makersuite.google.com/app/apikey |
| **GitHub Repo** | https://github.com/polagalleanipgpg/quizzty |
| **SQL Editor** | https://supabase.com/dashboard/project/ejbwehcaylbuymvchodv/sql/new |

---

## 📞 SOPORTE

Si tenés algún error:

1. **Abrí la consola** (F12)
2. **Copiá el error completo**
3. **Pegalo en el chat** para que te ayude

---

## ✅ CHECKLIST FINAL

Después de seguir esta guía, deberías poder:

- [ ] Ver el dashboard sin errores
- [ ] Crear quizzes manualmente
- [ ] Crear quizzes con IA
- [ ] Ver quizzes en el dashboard
- [ ] Iniciar una sesión
- [ ] Ver el QR correctamente
- [ ] Unir estudiantes con PIN
- [ ] Jugar en tiempo real
- [ ] Ver el leaderboard
- [ ] Ver el podio final

---

**¡Espero que todo funcione perfecto! 🚀**

Cualquier duda, avisame.
