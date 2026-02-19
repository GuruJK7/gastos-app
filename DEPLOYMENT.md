# 🚀 Guía de Deployment - Poner la App en Producción

## 📋 Checklist Pre-Deployment

Antes de publicar tu app, verifica que todo esté listo:

### ✅ Código y Funcionalidad
- [ ] App funciona localmente sin errores
- [ ] Puedes registrarte e iniciar sesión
- [ ] Puedes crear, leer y eliminar gastos
- [ ] Los gráficos se muestran correctamente
- [ ] La app es responsive en mobile, tablet y desktop
- [ ] Probaste con datos demo
- [ ] Exportar a CSV funciona

### ✅ Firebase
- [ ] Proyecto Firebase creado
- [ ] Email/Password habilitado en Auth
- [ ] Firestore Database creado
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Reglas de seguridad publicadas en Firestore
- [ ] Datos de prueba se guardan en Firestore
- [ ] Puedes acceder a tus datos desde otro navegador (mismo usuario)

### ✅ Seguridad
- [ ] `.env.local` está en `.gitignore`
- [ ] No subiste credenciales a GitHub
- [ ] Reglas Firestore restringen acceso a usuarios autenticados
- [ ] Validaciones en el frontend
- [ ] Validaciones en las reglas Firestore

### ✅ Performance
- [ ] App carga en menos de 3 segundos
- [ ] Gráficos no tienen lag
- [ ] Tabla responde rápido con muchos datos
- [ ] Imágenes están optimizadas
- [ ] No hay console errors

### ✅ UX/Diseño
- [ ] Colores se ven bien en tema oscuro
- [ ] Tipografía es legible
- [ ] Botones son clickeables en mobile
- [ ] No hay overflow horizontal
- [ ] Los mensajes de error son claros

---

## 🌍 Opción 1: Deploy en Vercel (Recomendado)

**Ventajas:**
- ⚡ Más rápido
- 🔄 Deploy automático desde GitHub
- 🌐 CDN global
- 💰 Plan gratuito generoso
- 📊 Analytics incluido

### Paso 1: Preparar el Proyecto

```bash
# Asegúrate de que está todo commiteado
git add .
git commit -m "Setup Firebase y autenticación"
git push
```

### Paso 2: Conectar Vercel

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en **"Sign Up"** → Selecciona **"Continue with GitHub"**
3. Autoriza Vercel a acceder a tus repos
4. Haz clic en **"New Project"**
5. Importa el repositorio `gastos-app`

### Paso 3: Configurar Variables de Entorno

1. En Vercel, en la pantalla de importación:
2. Abre **"Environment Variables"**
3. Agrega cada variable de Firebase:

```
REACT_APP_FIREBASE_API_KEY = AIzaSyD8E1oIK4dX_qA__-tyQkI_NQ2JjAP9HXg
REACT_APP_FIREBASE_AUTH_DOMAIN = moneyadmin-d2b8c.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = moneyadmin-d2b8c
REACT_APP_FIREBASE_STORAGE_BUCKET = moneyadmin-d2b8c.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 514421288905
REACT_APP_FIREBASE_APP_ID = 1:514421288905:web:62834a4b750746950bc218
REACT_APP_FIREBASE_MEASUREMENT_ID = G-SKYMNL2JN6
```

4. Haz clic en **"Deploy"**

### Paso 4: Esperar el Deploy

- Vercel construirá tu app automáticamente
- Verás una URL como: `gastos-app-xxxxx.vercel.app`
- El deploy toma 2-3 minutos

### Paso 5: Configurar Dominio (Opcional)

1. En Vercel, ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado (ej: `gastos.tudominio.com`)
3. Sigue las instrucciones de DNS

---

## 🔥 Opción 2: Deploy en Firebase Hosting

**Ventajas:**
- 🔗 Mismo proyecto que tu backend
- 🔄 Deploy fácil desde CLI
- 💰 Plan gratuito

### Paso 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### Paso 2: Login en Firebase

```bash
firebase login
```

Se abrirá una ventana del navegador para autorizar.

### Paso 3: Inicializar Hosting

```bash
firebase init hosting
```

Contesta las preguntas:
- **What do you want to use as your public directory?** → `build`
- **Configure as a single-page app?** → `Yes`
- **Set up automatic builds and deploys with GitHub?** → `Yes` (opcional)

### Paso 4: Build para Producción

```bash
npm run build
```

Esto crea la carpeta `build/` optimizada.

### Paso 5: Deploy

```bash
firebase deploy
```

Verás un mensaje como:
```
✔ Deploy complete!
Your public URL: https://moneyadmin-d2b8c.web.app
```

---

## 🌐 Opción 3: Deploy en Netlify

**Ventajas:**
- 🖱️ Super fácil (arrastra y suelta)
- 🔄 Deploy automático desde GitHub
- 💰 Plan gratuito

### Paso 1: Preparar Build

```bash
npm run build
```

### Paso 2: Ir a Netlify

1. Ve a [Netlify](https://netlify.com)
2. Haz clic en **"Sign up"** → Selecciona **"Continue with GitHub"**
3. Autoriza Netlify

### Paso 3: Crear Sitio

1. Haz clic en **"New site from Git"**
2. Selecciona tu repositorio `gastos-app`
3. Verifica que:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Abre **"Advanced build settings"**
5. Agrega las variables de entorno de Firebase

### Paso 4: Deploy

1. Haz clic en **"Deploy site"**
2. Espera 2-3 minutos
3. Netlify te dará una URL como: `gastos-app-xxxxx.netlify.app`

---

## ✅ Después del Deployment

### Validar que la App Funciona

1. **Abre la URL** del sitio deployado
2. **Crea una cuenta** con un email real
3. **Agrega un gasto**
4. **Abre otra pestaña** con el mismo email
5. Verifica que **ves el mismo gasto** (datos sincronizados)

### Configurar Dominio Personalizado

Todas las opciones permiten dominio propio:
- Vercel: Settings → Domains
- Firebase: Hosting → Domains
- Netlify: Domain settings

Cuesta ~$10-15/año en registradores como Namecheap.

### Monitoreo

- **Vercel**: Analytics → Dashboard
- **Firebase**: Console → Analytics
- **Netlify**: Analytics

---

## 🔐 Seguridad en Producción

### 1. Restringir API Keys

En [Firebase Console](https://console.firebase.google.com/):
1. Ve a **Project Settings** → **Service Accounts**
2. Busca tu clave API
3. Haz clic en **"Edit API key"**
4. En **"Application restrictions"**, selecciona:
   - ✅ **HTTP referrers (web sites)**
   - Agrega tu dominio: `*.tudominio.com`

### 2. Habilitar reCAPTCHA

En Authentication:
1. Ve a **Settings** → **reCAPTCHA Enterprise**
2. Habilita para signup y login
3. Protege contra bots

### 3. Configurar Reglas Firestore Strictas

Ya lo hiciste en `firestore.rules`. Verifica que estén publicadas.

### 4. Habilitar HTTPS

- ✅ Vercel: Automático
- ✅ Firebase: Automático
- ✅ Netlify: Automático

---

## 📊 Monitoreo Continuo

### Errores

Abre DevTools (F12) en producción para ver:
- Console errors
- Network requests
- Performance metrics

### Logs de Firebase

En Firebase Console:
1. Ve a **Functions** (si usas)
2. Ve a **Realtime Database** → **Rules** → **Logs**

### Alertas

Configura alertas en:
- Google Cloud Console
- Firebase Console
- Vercel/Netlify

---

## 🐛 Troubleshooting en Producción

### "Permission Denied" en Firestore
**Causa:** Reglas no publicadas o usuario no autenticado
**Solución:** Verifica reglas en Firebase Console

### "Cannot find module"
**Causa:** Variable de entorno no configurada
**Solución:** Verifica `.env` en tu plataforma de deploy

### "App carga lenta"
**Causa:** Bundle grande o conexión lenta
**Solución:**
```bash
npm run build -- --analyze
# Ver tamaño de cada módulo
```

### "Gráficos no se muestran"
**Causa:** Recharts necesita contenedor con ancho definido
**Solución:** Verifica que `.chart-container` tiene `width: 100%`

---

## 📈 Optimizaciones Futuras

Después del deployment inicial:

1. **Code Splitting** - Dividir bundle en chunks
2. **Lazy Loading** - Cargar componentes bajo demanda
3. **Image Optimization** - Comprimir imágenes
4. **Service Workers** - Offline support
5. **CDN** - Servir assets desde edge servers

---

## 🎉 ¡Deployment Exitoso!

Una vez deployado:
- ✅ Compartir URL con amigos
- ✅ Usar en producción
- ✅ Monitorear performance
- ✅ Agregar nuevas features
- ✅ Celebrar 🎊

---

## 📞 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Netlify Docs](https://docs.netlify.com)
- [React Build Optimization](https://create-react-app.dev/docs/production-build/)

---

**¿Listos para compartir tu app con el mundo?** 🚀