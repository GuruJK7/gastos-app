# 🔥 Guía de Configuración Firebase

## Paso 1: Crear un Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Crear un proyecto"** (Create a project)
3. Ingresa el nombre de tu proyecto: `gastos-app`
4. Acepta los términos y crea el proyecto
5. Espera a que se cree (toma unos segundos)

## Paso 2: Registrar tu App Web

1. En la vista general del proyecto, haz clic en el icono **</> (Web)**
2. Dale un apodo: `Gestor de Gastos Premium`
3. Copia el objeto `firebaseConfig` que aparece
4. Haz clic en **"Siguiente"** hasta terminar

## Paso 3: Obtener tus Credenciales

Las credenciales están en el objeto `firebaseConfig` que copiaste. Deberían verse así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "gastos-app-xxxxx.firebaseapp.com",
  projectId: "gastos-app-xxxxx",
  storageBucket: "gastos-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Paso 4: Configurar Variables de Entorno

Abre el archivo `.env.local` en la raíz de tu proyecto:

```bash
REACT_APP_FIREBASE_API_KEY=AIzaSyC...
REACT_APP_FIREBASE_AUTH_DOMAIN=gastos-app-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=gastos-app-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=gastos-app-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Paso 5: Habilitar Firestore Database

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **"Crear base de datos"** (Create database)
3. Selecciona **"Iniciar en modo prueba"** (Start in test mode)
4. Elige tu región (ej: `nam5` para América del Norte)
5. Haz clic en **"Crear"**

> ⚠️ **Nota:** El modo prueba permite lectura/escritura sin autenticación. Para producción, configura reglas de seguridad:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gastos/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Paso 6: (Opcional) Habilitar Autenticación

1. Ve a **Authentication** en Firebase Console
2. Haz clic en **"Get Started"**
3. Habilita **"Email/Password"** si deseas login de usuarios

## Paso 7: Reinicia tu servidor React

Después de actualizar `.env.local`:

```bash
npm start
```

Si ya estaba corriendo, detén el servidor (Ctrl+C) y reinicia.

---

## ✅ Checklist de Verificación

- [ ] Proyecto creado en Firebase Console
- [ ] App web registrada
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Firestore Database habilitada
- [ ] Servidor React reiniciado
- [ ] App funcionando correctamente

## 🔐 Seguridad

- ✅ `.env.local` está en `.gitignore` (no se subirá a GitHub)
- ✅ Las credenciales se cargan desde variables de entorno
- ✅ Las claves API de Firebase tienen restricciones en Console

## 📚 Recursos

- [Firebase Console](https://console.firebase.google.com/)
- [Documentación Firestore](https://firebase.google.com/docs/firestore)
- [Documentación Firebase Auth](https://firebase.google.com/docs/auth)