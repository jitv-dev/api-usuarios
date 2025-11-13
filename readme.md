# API de Usuarios

API RESTful para gestión de usuarios con autenticación JWT, subida de imágenes y operaciones CRUD completas.

## Tabla de Contenidos

-   [Características](#características)
-   [Tecnologías](#tecnologías)
-   [Prerrequisitos](#prerrequisitos)
-   [Instalación](#instalación)
-   [Configuración](#configuración)
-   [Ejecución](#ejecución)
-   [Endpoints](#endpoints)
-   [Códigos de Estado](#códigos-de-estado)
-   [Notas Importantes](#notas-importantes)
-   [Solución de Problemas](#solución-de-problemas)

## Características

-   Registro, login y autenticación JWT.
-   CRUD de usuarios.
-   Subida y actualización de imágenes.
-   Validación de formatos y tamaños.
-   Manejo de respuestas HTTP claras.

## Tecnologías

-   Node.js
-   Express
-   bcryptjs
-   jsonwebtoken
-   express-fileupload
-   dotenv

## Prerrequisitos

-   Node.js v16 o superior
-   npm

## Instalación

Instalar dependencias:

    npm install

Crear archivo `.env`:

    SECRET_KEY=tu_clave_secreta
    JWT_EXPIRES_IN=1h

## Ejecución

Iniciar servidor:

    npm start

Disponible en:

    http://localhost:3000

## Endpoints

### 1. Registro de Usuario

**POST /api/register**\
Body:

    {
        "nombre": "jabier",
        "email": "jabier@email.com",
        "password": "123"
    }

### 2. Login

**POST /api/login**\
Body:

    {
        "email": "jabier@email.com",
        "password": "123"
    }

Respuesta:

    {
        "mensaje": "Logeado exitosamente",
        "id": 123456789,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }

**Para todos los endpoints a continuación se requiere Authorization: Bearer <token_jwt>**

### 3. Obtener Perfil

**GET /api/usuarios/:id**

### 4. Actualizar Usuario

**PUT /api/usuarios/:id**
Campos permitidos: nombre, email y password\
Body:

    {
        "nombre": "Nuevo nombre",
        "email": "nuevoemail@email.com",
        "password": "nuevapassword"
    }

### 5. Eliminar Usuario

**DELETE /api/usuarios/:id**

### 6. Subir Imagen

**POST /api/usuarios/:id/imagen**

Formatos permitidos: JPG, JPEG, PNG
Máximo: 5MB

## Códigos de Estado

-   200: OK
-   201: Creado
-   400: Datos inválidos
-   401: No autorizado
-   403: Prohibido
-   404: No encontrado
-   413: Archivo grande
-   500: Error servidor

## Notas Importantes

-   JWT expira en 1 hora.
-   Cada usuario solo gestiona su propia cuenta.
-   Para cambiar la imagen de perfil, solo debe postearse una nueva, la anterior será eliminada.
-   Imágenes en `/uploads`.
-   Usuarios almacenados en `data/usuarios.json`.
-   Las contraseñas se almacenan hasheadas con bcrypt.

## Solución de Problemas

**Token inválido:** Revisar header Authorization.\
**No autorizado:** ID del token no coincide con el de la ruta.\
**Imagen no permitida:** Solo jpg, jpeg, png.\
**Archivo grande:** Máximo 5MB.