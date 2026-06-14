# Inmobiliaria Ushuaia - MVP

Este proyecto es un **Producto Mínimo Viable (MVP)** para una plataforma web de gestión y visualización de propiedades inmobiliarias en Ushuaia. Su objetivo es proporcionar a los clientes una interfaz intuitiva para buscar e informarse sobre propiedades en alquiler o venta, y a los agentes/administradores una herramienta centralizada para gestionar el catálogo y recibir consultas.

---

## 🚀 Objetivo del MVP

El propósito de este MVP es validar la funcionalidad principal de la plataforma, que incluye:
1. **Catálogo Público**: Permitir a los usuarios explorar propiedades disponibles en Ushuaia, ver sus detalles, ubicarlas en un mapa y enviar consultas de contacto.
2. **Panel de Administración (Dashboard)**: Proveer una sección privada para que los agentes administren las propiedades (crear, editar, eliminar, subir fotos) y visualicen los mensajes de consulta de los clientes.
3. **Roles y Permisos**: Probar un flujo de trabajo simplificado con distintos tipos de usuarios/roles para simular la operación real de la inmobiliaria.

---

## ✨ Características Principales

### Para los Clientes (Público)
* **Búsqueda y Filtros**: Buscador interactivo por tipo de propiedad (casa, departamento, terreno, etc.), tipo de operación (alquiler, venta) y rango de precios.
* **Fichas Detalladas**: Visualización de características esenciales (habitaciones, baños, metros cuadrados) y descripción.
* **Carrusel de Fotos**: Galería de imágenes de cada propiedad.
* **Mapas Interactivos**: Integración de mapas con Leaflet para mostrar la ubicación exacta de cada propiedad en la ciudad de Ushuaia.
* **Formulario de Contacto**: Envío de consultas directas asociadas a una propiedad específica.

### Para el Personal (Privado/Dashboard)
* **Gestión de Propiedades**: CRUD completo (Crear, Leer, Actualizar, Eliminar) para el catálogo de inmuebles.
* **Gestión de Multimedia**: Carga múltiple de imágenes de propiedades con optimización automática.
* **Control de Mensajes**: Bandeja de entrada para revisar y gestionar los mensajes de consulta enviados por los clientes.
* **Acceso Seguro**: Autenticación y autorización basada en JWT.

---

## 🛠️ Stack Tecnológico

El proyecto está diseñado bajo una arquitectura desacoplada:

* **Frontend**:
  * **React.js** (con Vite como herramienta de construcción)
  * **React Router DOM** para la navegación SPA
  * **Leaflet & React Leaflet** para los mapas interactivos
  * **Lucide React** para la iconografía
  * **CSS Moderno** para estilos personalizados

* **Backend**:
  * **Node.js** con **Express.js** como servidor API REST
  * **Sequelize ORM** para interactuar con la base de datos
  * **MySQL** como base de datos relacional
  * **Multer & Sharp** para gestionar la carga y optimización de imágenes
  * **JSON Web Tokens (JWT) & bcryptjs** para la seguridad

* **Infraestructura**:
  * **Docker & Docker Compose** para la contenedorización y ejecución ágil en cualquier entorno.

---

## 📁 Estructura del Proyecto

```text
Inmobiliaria Ushuaia/
├── client/                 # Aplicación Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Componentes reutilizables (Header, Footer, PropertyCard, etc.)
│   │   ├── context/        # Contextos de React (por ejemplo, para autenticación)
│   │   ├── pages/          # Páginas principales (Home, Dashboard, PropertyDetails, etc.)
│   │   └── index.css       # Estilos globales de la aplicación
│   └── Dockerfile          # Configuración Docker para Frontend
│
├── server/                 # API Backend (Node.js + Express)
│   ├── config/             # Configuración de base de datos y conexión
│   ├── controllers/        # Controladores de la API (propiedades, usuarios, mensajes)
│   ├── middleware/         # Middlewares (autenticación, validación)
│   ├── models/             # Modelos de Sequelize (Property, User, ContactMessage, etc.)
│   ├── uploads/            # Carpeta para almacenamiento de imágenes subidas
│   └── Dockerfile          # Configuración Docker para Backend
│
├── docker-compose.yml      # Configuración de servicios (db, server, client)
└── README.md               # Documentación del proyecto
```

---

## 🔑 Credenciales de Prueba (MVP)

Para facilitar las pruebas de los distintos flujos y niveles de acceso en el panel de administración, se configuraron los siguientes usuarios por defecto:

1. **SuperAdministrador** (Control Total)
   * **Usuario/Correo**: `superadmin@inmobiliariaushuaia.com`
   * **Contraseña**: `superadmin123`

2. **Dueño / Martillero** (Gestión, aprobación y visualización de estadísticas)
   * **Usuario/Correo**: `martillero@inmobiliariaushuaia.com`
   * **Contraseña**: `martillero123`

3. **Agente / Secretaria** (Carga y edición de propiedades)
   * **Usuario/Correo**: `agente@inmobiliariaushuaia.com`
   * **Contraseña**: `agente123`

---

## 🚀 Cómo Iniciar el Proyecto

### Requisitos Previos
* Tener instalado **Docker** y **Docker Compose**.

### Instrucciones
1. Abre una terminal en la raíz del proyecto.
2. Ejecuta el siguiente comando para compilar y levantar los contenedores:
   ```bash
   docker-compose up --build
   ```
3. Una vez finalizado el inicio de los contenedores, accede en tu navegador a:
   * **Frontend**: [http://localhost:3000](http://localhost:3000)
   * **Backend API**: [http://localhost:5000](http://localhost:5000)
   * **Base de datos (MySQL)**: Expuesta localmente en el puerto `3307`
