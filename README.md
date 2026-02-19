# 💰 Gestor de Gastos Premium - Dashboard Financiero Inteligente

Una aplicación web moderna para administrar y analizar tus gastos personales con sincronización en tiempo real usando Firebase.

---

## 🚀 Características Principales

### ✨ Diseño
- **Dark Mode Premium** - Interfaz elegante y minimalista
- **Glassmorphism** - Efectos de vidrio translúcido suave
- **Fully Responsive** - Perfecto en PC, tablet y celular
- **Microinteracciones** - Animaciones sutiles y transiciones fluidas
- **Tipografía Moderna** - System fonts con fallback a Inter

### 📊 Funcionalidades
- ✅ **Registro de Gastos** - Formulario intuitivo con múltiples categorías
- ✅ **Dashboard Análítico** - Métricas KPI en tiempo real
- ✅ **Gráficos Interactivos** - Line chart y pie chart con Recharts
- ✅ **Tabla Histórica** - Listado completo de transacciones
- ✅ **Exportar CSV** - Descargar datos en Excel/Sheets
- ✅ **Datos Demo** - Cargar datos de ejemplo con un clic

### 🔐 Autenticación
- ✅ **Firebase Auth** - Registro e inicio de sesión seguro
- ✅ **Sincronización en Nube** - Firestore para persistencia de datos
- ✅ **Modo Anónimo** - localStorage como fallback
- ✅ **Sesión Persistente** - Mantener sesión entre navegación

### 📱 Responsividad
- ✅ **Desktop** (1200px+) - 3 métricas, gráficos grandes
- ✅ **Tablet** (768px) - 2 columnas, optimizado
- ✅ **Mobile** (< 600px) - 1 columna, touch-friendly
- ✅ **Extra Pequeño** (< 380px) - Ultra compacto
- ✅ **Landscape** - Optimizado para horizontal

---

## 📋 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Configuración Firebase](#configuración-firebase)
3. [Uso de la Aplicación](#uso-de-la-aplicación)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Desarrollo](#desarrollo)
6. [Deployment](#deployment)

---

## 📥 Instalación

### Requisitos Previos
- Node.js 14+ y npm
- Cuenta en [Firebase Console](https://console.firebase.google.com/)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Pasos

1. **Clonar o descargar el proyecto:**
```bash
git clone <tu-repo>
cd gastos-app
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno** (ver siguiente sección)

4. **Iniciar servidor de desarrollo:**
```bash
npm start
```

La app se abrirá en `http://localhost:3000`

---

## 🔥 Configuración Firebase

### Paso 1: Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Crear un proyecto"**
3. Ingresa nombre: `gastos-app`
4. Acepta términos y espera a que se cree

### Paso 2: Registrar App Web

1. En la vista del proyecto, haz clic en **</> (Web)**
2. Dale nombre: `Gestor de Gastos Premium`
3. **Copia el objeto `firebaseConfig`**
4. Completa el setup y copia los valores

### Paso 3: Configurar Variables de Entorno

En la **raíz del proyecto**, crea/edita `.env.local`:

```bash
REACT_APP_FIREBASE_API_KEY=AIzaSyD8E1oIK4dX_qA__-tyQkI_NQ2JjAP9HXg
REACT_APP_FIREBASE_AUTH_DOMAIN=moneyadmin-d2b8c.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=moneyadmin-d2b8c
REACT_APP_FIREBASE_STORAGE_BUCKET=moneyadmin-d2b8c.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=514421288905
REACT_APP_FIREBASE_APP_ID=1:514421288905:web:62834a4b750746950bc218
REACT_APP_FIREBASE_MEASUREMENT_ID=G-SKYMNL2JN6
```

⚠️ **IMPORTANTE:** `.env.local` está en `.gitignore` (no se sube a GitHub)

### Paso 4: Habilitar Firestore Database

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Iniciar en modo prueba"**
4. Elige región (ej: `nam5`)
5. Haz clic en **"Crear"**

### Paso 5: Habilitar Autenticación

1. Ve a **Authentication**
2. Haz clic en **"Get Started"**
3. Habilita **Email/Password**

### Paso 6: Reiniciar Servidor

```bash
# Si estaba corriendo, presiona Ctrl+C y:
npm start
```

---

## 💻 Uso de la Aplicación

### Primera Vez
1. La app te mostrará un modal de **Login/Signup**
2. Crea una cuenta con tu email y contraseña (mín. 6 caracteres)
3. ¡Listo! Ya estás registrado

### Registrar un Gasto
1. Completa el formulario con:
   - **Fecha**: Selecciona fecha del gasto
   - **Monto**: Cantidad gastada
   - **Categoría**: Elige entre 11 opciones
   - **Subcategoría**: Personalizada (opcional)
   - **Método de Pago**: Efectivo, Débito, Crédito, Transferencia
   - **Descripción**: Detalles (opcional)
2. Haz clic en **"✓ Registrar Gasto"**

### Ver Análisis
- **Métricas KPI**: Ves total, promedio diario y por transacción
- **Gráfico de Línea**: Evolución de gastos por día
- **Gráfico Circular**: Distribución por categoría
- **Tabla**: Historial completo con scroll horizontal

### Exportar Datos
1. Haz clic en **"📥 Exportar a CSV"**
2. Se descarga un archivo Excel con tus gastos

### Cargar Datos Demo
1. Haz clic en **"📊 Cargar Datos Demo"**
2. Se agregan 6 transacciones de ejemplo

### Cerrar Sesión
1. Haz clic en **"🚪 Cerrar Sesión"** en el header
2. Se borrará la sesión y volverá a mostrar el login

---

## 📁 Estructura del Proyecto

```
src/
├── App.js                    # Componente principal
├── App.css                   # Estilos de App
├── index.js                  # Punto de entrada
├── index.css                 # Estilos globales (minimalista)
├── firebase.js               # Configuración Firebase
├── components/
│   └── AuthModal.js          # Modal login/signup
├── contexts/
│   └── AuthContext.js        # Context para autenticación
└── hooks/
    └── useGastos.js          # Hook para CRUD de gastos
```

### Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| `firebase.js` | Inicializa Firebase, Firestore y Auth |
| `AuthContext.js` | Provee login, signup, logout |
| `useGastos.js` | Hook que maneja Firestore + localStorage |
| `AuthModal.js` | Componente de login/signup |
| `App.js` | Dashboard principal |
| `index.css` | Estilos dark mode, responsive, minimalista |

---

## 🛠️ Desarrollo

### Stack Tecnológico
- **React 19** - Framework UI
- **Firebase** - Backend (Auth + Firestore)
- **Recharts** - Gráficos interactivos
- **react-csv** - Exportar a CSV

### Scripts Disponibles

```bash
npm start          # Inicia servidor dev en puerto 3000
npm run build      # Build para producción
npm test           # Ejecuta tests
npm run eject      # Eject de create-react-app (irreversible)
```

### Variables Globales de Color
```css
--cyan: #22d3ee           /* Color primario */
--cyan-dark: #06b6d4      /* Hover */
--text: #f1f5f9           /* Texto principal */
--text-secondary: #cbd5e1 /* Texto secundario */
--bg-dark: #0f172a        /* Fondo oscuro */
```

### Extensibilidad

Puedes agregar:
- 🎯 **Filtros por fecha** en la tabla
- 📈 **Gráfico de barras** por mes
- 💾 **Backup automático** a Drive
- 📤 **Compartir gastos** entre usuarios
- 🔔 **Notificaciones push**
- 📊 **Reportes PDF**

---

## 🚀 Deployment

### Deploy en Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Deploy en Firebase Hosting

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

### Deploy en Netlify

```bash
npm run build
# Arrastra la carpeta 'build' a Netlify
```

---

## 🔐 Seguridad

✅ **Lo que está seguro:**
- Variables de entorno no se suben a GitHub
- Firestore tiene reglas de seguridad
- Contraseñas encriptadas en Firebase
- HTTPS en producción (automático en Vercel/Firebase)

⚠️ **Para producción:**
1. Configura reglas Firestore más estrictas
2. Restringe API keys en Firebase Console
3. Habilita reCAPTCHA en Auth
4. Usa HTTPS obligatorio
5. Implementa rate limiting

---

## 📞 Soporte

- 📖 [Documentación Firebase](https://firebase.google.com/docs)
- 📖 [Documentación Recharts](https://recharts.org)
- 🐛 Abre un issue en el repositorio

---

## 📄 Licencia

Este proyecto está disponible bajo licencia MIT.

---

## 🎉 ¡Listo para usar!

1. ✅ Instalaste dependencias
2. ✅ Configuraste Firebase
3. ✅ Iniciaste el servidor
4. ✅ ¡Crea tu cuenta y comienza a registrar gastos!

**¿Preguntas?** Consulta `FIREBASE_SETUP.md` para más detalles de configuración.
