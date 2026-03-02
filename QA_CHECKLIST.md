# 📋 CHECKLIST QA - QUIZZTY PROJECT

## ✅ PRE-DEPLOY CHECKLIST

### **1. Autenticación**
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Logout funciona
- [ ] Usuario se guarda en teachers table

### **2. Dashboard**
- [ ] Lista quizzes del usuario
- [ ] Muestra cantidad de preguntas
- [ ] Botón "Jugar" redirige a select-mode
- [ ] Botón "Editar" carga quiz
- [ ] Botón "Eliminar" funciona
- [ ] Botón "Crear" funciona

### **3. Crear Quiz**
- [ ] Pide título (requerido)
- [ ] Valida al menos 1 pregunta
- [ ] Valida cada pregunta tiene texto
- [ ] Valida cada pregunta tiene respuesta correcta
- [ ] Guarda quiz en DB
- [ ] Guarda preguntas en DB
- [ ] Redirige a dashboard
- [ ] Muestra toast de éxito

### **4. Editar Quiz**
- [ ] Carga datos del quiz
- [ ] Carga preguntas existentes
- [ ] Permite modificar
- [ ] Guarda cambios
- [ ] Elimina preguntas viejas
- [ ] Inserta preguntas nuevas

### **5. Select Mode**
- [ ] Muestra 4 modos de juego
- [ ] Crea sesión con modo seleccionado
- [ ] Genera PIN único
- [ ] Redirige a lobby

### **6. Lobby**
- [ ] Muestra QR grande
- [ ] Muestra PIN enorme
- [ ] Lista participantes en tiempo real
- [ ] Botón "Comenzar" habilita solo con participantes
- [ ] Redirige a juego al comenzar

### **7. Juego**
- [ ] Muestra pregunta
- [ ] Temporizador funciona
- [ ] Permite responder
- [ ] Valida respuesta
- [ ] Muestra feedback (correcto/incorrecto)
- [ ] Actualiza leaderboard
- [ ] Avanza a siguiente pregunta

### **8. Resultados**
- [ ] Muestra podio final
- [ ] Muestra leaderboard completo
- [ ] Permite compartir/exportar

---

## 🐛 BUGS CONOCIDOS

| Bug | Estado | Prioridad |
|-----|--------|-----------|
| Questions no se guardan | 🟡 En Fix | 🔴 HIGH |
| QR no se muestra | ✅ Fixeado | - |
| Lobby da error null | ✅ Fixeado | - |
| Edit page no existe | ✅ Creada | - |
| IA da error 403 | 🟡 API Key | MEDIUM |

---

## 🔍 TEST CASES

### **TC-001: Crear Quiz Manual**
```
1. Ir a /teacher/create
2. Completar título: "Test QA"
3. Agregar 1 pregunta: "¿2+2?"
4. Opciones: "4", "5", "3", "6"
5. Marcar "4" como correcta
6. Click "Guardar"
7. Verificar en dashboard
8. Verificar en DB (tabla questions)
```

**Resultado Esperado:**
- Quiz aparece en dashboard
- Dice "1 preguntas"
- En DB: 1 row en quizzes, 1 row en questions

---

### **TC-002: Editar Quiz**
```
1. Dashboard → Click lápiz en quiz
2. Modificar título
3. Agregar pregunta
4. Click "Guardar"
5. Verificar cambios
```

**Resultado Esperado:**
- Título actualizado
- Nueva pregunta agregada
- Preguntas viejas se mantienen (o se reemplazan)

---

### **TC-003: Iniciar Juego**
```
1. Dashboard → Click "Jugar"
2. Elegir modo "Clásico"
3. Esperar que cargue lobby
4. Ver QR visible
5. Ver PIN visible
6. Abrir otra pestaña → /join
7. Unirse con PIN
8. Verificar que aparece en lobby
9. Click "Comenzar"
```

**Resultado Esperado:**
- Sesión se crea
- QR se muestra
- PIN funciona
- Participante aparece
- Juego comienza

---

### **TC-004: Juego en Vivo**
```
1. En juego como estudiante
2. Ver pregunta
3. Responder
4. Ver feedback
5. Ver leaderboard actualizado
```

**Resultado Esperado:**
- Pregunta se muestra
- Respuesta se guarda
- Feedback aparece
- Leaderboard se actualiza

---

## 📊 DB SCHEMA VALIDATION

```sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar quizzes
SELECT COUNT(*) FROM public.quizzes;

-- Verificar questions
SELECT COUNT(*) FROM public.questions;

-- Verificar sesiones
SELECT COUNT(*) FROM public.sessions;

-- Verificar RLS policies
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🚀 DEPLOY CHECKLIST

- [ ] Build local funciona (`npm run build`)
- [ ] Tests manuales pasan
- [ ] Git push completado
- [ ] Vercel deploy automático
- [ ] Variables de entorno en Vercel
- [ ] DB migrations aplicadas
- [ ] RLS policies aplicadas
- [ ] SSL activo en Vercel
- [ ] Dominio configurado (opcional)

---

## 📞 SOPORTE

**Si un test falla:**
1. Abrir consola (F12)
2. Copiar error completo
3. Ver logs de Vercel
4. Verificar DB en Supabase

**Logs importantes:**
- `📝 Saving quiz...`
- `✅ Quiz created: [id]`
- `📝 Inserting N questions...`
- `✅ Questions inserted: N`

---

**Fecha:** Marzo 2026  
**Versión:** 1.0.0  
**Estado:** EN AUDITORÍA
