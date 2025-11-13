const express = require('express');
const router = express.Router()
const usuariosController = require('../controllers/usuariosController')

// Crear usuario
router.post('/register', usuariosController.register)

// Logear usuario
router.post('/login', usuariosController.login)

// Muestra usuario por ID
router.get('/usuarios/:id', usuariosController.show)

// Actualizar usuario
router.put('/usuarios/:id', usuariosController.update)

// Eliminar usuario
router.delete('/usuarios/:id', usuariosController.delete)

// Subir imagen
router.post('/usuarios/:id/imagen', usuariosController.uploadImg)

module.exports = router