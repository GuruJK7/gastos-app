# 🔐 Guía de Configuración de Reglas Firestore

## ¿Por qué son importantes las reglas de Firestore?

Las reglas de seguridad protegen tu base de datos:
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Cada usuario ve solo sus propios gastos
- ✅ Se validan datos antes de guardar (monto > 0, campos requeridos)
- ✅ Previene manipulación o lectura no autorizada

---

## 📋 Paso a Paso: Implementar Reglas

### 1. Ir a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `moneyadmin-d2b8c`
3. En el menú izquierdo, haz clic en **Firestore Database**

### 2. Ir a la Sección de Reglas

1. En la pestaña **Firestore Database**, busca la pestaña **Rules**
2. Haz clic en **Rules**

### 3. Reemplazar Reglas Actuales

1. **Selecciona TODO el texto actual** en el editor (Ctrl+A o Cmd+A)
2. **Borra** el contenido
3. **Copia y pega** el contenido del archivo `firestore.rules` de este proyecto

El contenido debe verse así:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gastos/{document=**} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      // ... más reglas ...
    }
  }
}
```

### 4. Publicar Reglas

1. Haz clic en el botón **"Publicar"** (arriba a la derecha)
2. Espera a que se publique (2-3 segundos)
3. Verás un mensaje de confirmación: ✅ **"Reglas publicadas"**

---

## 📊 Explicación de las Reglas

### Lectura (Read)
```javascript
allow read: if request.auth != null && 
               resource.data.userId == request.auth.uid;
```
- `request.auth != null`: El usuario debe estar autenticado
- `resource.data.userId == request.auth.uid`: El gasto debe pertenecerle

### Crear (Create)
```javascript
allow create: if request.auth != null && 
                 request.resource.data.userId == request.auth.uid &&
                 request.resource.data.monto > 0 &&
                 request.resource.data.fecha != null &&
                 request.resource.data.categoria != null &&
                 request.resource.data.metodoPago != null;
```
- Usuario autenticado ✅
- El userId que envía coincide con su uid ✅
- Monto debe ser mayor a 0 ✅
- Campos obligatorios no pueden ser nulos ✅

### Actualizar (Update)
```javascript
allow update: if request.auth != null && 
                 resource.data.userId == request.auth.uid &&
                 request.resource.data.userId == request.auth.uid &&
                 request.resource.data.monto > 0;
```
- Usuario autenticado ✅
- El documento existente le pertenece ✅
- El nuevo userId sigue siendo el mismo ✅
- Monto válido ✅

### Eliminar (Delete)
```javascript
allow delete: if request.auth != null && 
                 resource.data.userId == request.auth.uid;
```
- Usuario autenticado ✅
- El documento le pertenece ✅

---

## 🧪 Probar las Reglas

### Test 1: Lectura sin autenticación
**Esperado:** ❌ Denegar
```
Leer: /gastos/doc1
→ Deniegado: request.auth == null
```

### Test 2: Lectura de gasto ajeno
**Esperado:** ❌ Denegar
```
Usuario: uid_alice
Leer: /gastos/doc1 (userId = uid_bob)
→ Deniegado: userId != uid_alice
```

### Test 3: Crear gasto con datos válidos
**Esperado:** ✅ Permitir
```
Usuario: uid_alice
Crear: /gastos/new
{
  userId: uid_alice,
  monto: 50,
  fecha: "2026-02-19",
  categoria: "Comida",
  metodoPago: "Efectivo"
}
→ Permitido: Todos los validadores pasan
```

### Test 4: Crear gasto sin monto
**Esperado:** ❌ Denegar
```
Usuario: uid_alice
Crear: /gastos/new
{
  userId: uid_alice,
  monto: null,  ← Inválido
  fecha: "2026-02-19",
  categoria: "Comida"
}
→ Deniegado: monto es nulo
```

---

## ⚠️ Modos de Firestore

| Modo | Descripción | Uso |
|------|-------------|-----|
| **Test** (Actual) | Sin reglas de seguridad | 📍 Desarrollo local |
| **Production** (Con Reglas) | Con reglas strictas | 📍 Deployment en vivo |

**Estado actual:** Test mode
**Próximo paso:** Publicar estas reglas antes de ir a producción

---

## ✅ Checklist

- [ ] Copiaste el contenido de `firestore.rules`
- [ ] Fuiste a Firebase Console → Firestore → Rules
- [ ] Reemplazaste las reglas actuales
- [ ] Hiciste clic en "Publicar"
- [ ] Viste el mensaje ✅ "Reglas publicadas"
- [ ] Probaste crear un gasto en la app
- [ ] Verificaste que aparece en Firestore Console

---

## 🆘 Troubleshooting

### "Error: Permission denied" al crear gasto
**Solución:** Verifica que:
1. Iniciaste sesión correctamente
2. Las reglas están publicadas
3. El gasto tiene todos los campos requeridos
4. El monto es > 0

### "Rules published but not working"
**Solución:** 
1. Recarga la página (Ctrl+R o Cmd+R)
2. Abre DevTools (F12) → Console para ver errores
3. Reinicia el servidor React (`npm start`)

### "Can't modify someone else's data"
**Comportamiento esperado:** Las reglas lo previenen. Cada usuario solo ve sus propios gastos.

---

## 📚 Recursos

- [Documentación Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Security Best Practices](https://firebase.google.com/docs/database/security/authentication)
- [Referencia de funciones de reglas](https://firebase.google.com/docs/reference/rules/rules.firestore)

---

## 🎯 Próximos Pasos

Después de publicar las reglas:
1. ✅ Prueba crear, leer, actualizar y eliminar gastos
2. ✅ Intenta acceder a datos de otro usuario (debe fallar)
3. ✅ Verifica que los datos persisten en Firestore Console
4. ✅ Prepárate para hacer deploy en producción

**¡Las reglas de seguridad están protegiendo tu app! 🔒**