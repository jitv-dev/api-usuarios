const { leerUsuarios, guardarUsuario } = require('../models/Usuario')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const { UPLOAD_DIR } = require('../config/paths')

exports.register = async (req, res) => {
    const usuarios = await leerUsuarios()
    // Pido el nombre del usuario para el perfil
    const { nombre, email, password } = req.body
    if (!nombre || !email || !password) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios' })
    }

    // Verifico si el email existe en la bdd/lista
    const usuarioExistente = usuarios.find(u => u.email === email)
    if (usuarioExistente) {
        return res.status(400).json({ mensaje: 'El correo ingresado ya existe' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const nuevoUsuario = {
        id: Date.now(),
        nombre,
        email,
        password: hashedPassword,
        img: null
    }

    // Agrego el nuevo usuario a mi bdd/lista
    usuarios.push(nuevoUsuario)
    await guardarUsuario(usuarios)

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' })
}
exports.login = async (req, res) => {
    const usuarios = await leerUsuarios()
    // Solicito solo el email y password para logearse, el nombre no es necesario
    const { email, password } = req.body

    const usuario = usuarios.find(u => u.email === email)
    if (!usuario) {
        return res.status(401).json({ mensaje: 'Correo o contraseña incorrecta' })
    }

    const passwordValida = await bcrypt.compare(password, usuario.password)
    if (!passwordValida) {
        return res.status(401).json({ mensaje: 'Correo o contraseña incorrecta' })
    }

    // Paso el nombre y el correo para poder usarlos en el perfil
    const token = jwt.sign(
        { id: usuario.id, usuario: usuario.nombre, correo: usuario.email },
        process.env.SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    // Agregue el id al mensaje que se envia para no tener que buscarlo en la bdd siempre
    res.json(
        { 
            mensaje: 'Logeado exitosamente',
            id: usuario.id,
            token
        }
    )
}

exports.show = async (req, res) => {
    try {
        const { id } = req.params
        const usuarios = await leerUsuarios()

        const usuario = usuarios.find(u => u.id === parseInt(id))
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })

        // Verifico el id enviado en el token y el de mi bdd
        if (req.auth.id !== usuario.id) return res.status(403).json({ error: 'No autorizado' })

        res.json({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            img: usuario.img || 'Sin imagen'
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al visualizar" })
    }
    
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params
        const { nombre, email, password } = req.body
        const usuarios = await leerUsuarios()

        const userIndex = usuarios.findIndex(u => u.id === parseInt(id))
        if (userIndex === -1) return res.status(404).json({ error: "Usuario no existe" })

        if (req.auth.id !== parseInt(id)) {
            return res.status(403).json({ error: 'No autorizado para actualizar este usuario' })
        }

        const usuario = usuarios[userIndex]

        const usuarioActualizado = { ...usuario }

        if (nombre) usuarioActualizado.nombre = nombre
        if (email) usuarioActualizado.email = email
        if (password) {
            // Hasheo de la nueva contraseña
            const hashedPassword = await bcrypt.hash(password, 10)
            usuarioActualizado.password = hashedPassword
        }

        usuarios[userIndex] = usuarioActualizado
        await guardarUsuario(usuarios)

        res.json({
            mensaje: 'Usuario actualizado correctamente',
            usuario: {
                id: usuarioActualizado.id,
                nombre: usuarioActualizado.nombre,
                email: usuarioActualizado.email,
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al actualizar' })
    }
    
}

exports.delete = async (req, res) => {
    try {
        const { id } = req.params
        const usuarios = await leerUsuarios()

        const userIndex = usuarios.findIndex(u => u.id === parseInt(id))
        if (userIndex === -1) return res.status(404).json({ error: "Usuario no existe" })

        if (req.auth.id !== parseInt(id)) {
            return res.status(403).json({ error: 'No autorizado para eliminar este usuario' })
        }

        // Saco al usuario del arreglo original
        const usuarioEliminado = usuarios.splice(userIndex, 1)[0]

        // Borro la img del usuario del sistema
        if (usuarioEliminado.img) {
            const rutaImg = path.join(UPLOAD_DIR, usuarioEliminado.img)
            try {
                await fs.promises.unlink(rutaImg)
                console.log(`Imagen eliminada: ${rutaImg}`)
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error('Error al eliminar imagen:', err)
                }
            }
        }

        // Actualizo la lista de usuarios
        await guardarUsuario(usuarios)
        
        res.json({
            mensaje: "Usuario eliminado",
            usuario: {
                id: usuarioEliminado.id,
                nombre: usuarioEliminado.nombre,
                email: usuarioEliminado.email,
                img: usuarioEliminado.img ? 'Imagen eliminada' : 'Sin imagen'
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al eliminar usuario' })
    }
    
}

exports.uploadImg = async (req, res) => {
    try {
        const { id } = req.params
        const imagen = req.files.img
        const usuarios = await leerUsuarios()

        const userIndex = usuarios.findIndex(u => u.id === parseInt(id))
        if (userIndex === -1) return res.status(404).json({ error: "Usuario no existe" })

        if (req.auth.id !== parseInt(id)) {
            return res.status(403).json({ error: 'No autorizado' })
        }

        const usuario = usuarios[userIndex]

        // Esto es para borrar la imagen de perfil anterior al subir una nueva
        if (usuario.img) {
            const rutaImgVieja = path.join(UPLOAD_DIR, usuario.img)
            if (fs.existsSync(rutaImgVieja)) {
                fs.unlinkSync(rutaImgVieja)
            }
        }

        const EXT_PERMITIDAS = ['.jpg', '.jpeg', '.png']
        const MAX_SIZE = 5 * 1024 * 1024 // = 5 Mb
        const extImg = path.extname(imagen.name).toLowerCase()

        if (!EXT_PERMITIDAS.includes(extImg)) return res.status(400).json({ error: 'Extension de img no permitida, los valores permitidos son: ', EXT_PERMITIDAS })
        if (imagen.size > MAX_SIZE) return res.status(413).json({ error: `Tamaño mayor al permitido: ${(imagen.size / (1024 * 1024)).toFixed(2)}Mb, el tamaño máximo es 5Mb` })

        const nombreImagen = `${usuario.id}_${imagen.name.replace(/\s+/g, '_')}`

        // Subo la imagen a la carpeta uploads
        await imagen.mv(path.join(UPLOAD_DIR, nombreImagen))

        // Agrego el img a mi usuario en concreto
        usuario.img = nombreImagen
        // Modifico el usuario en el arreglo
        usuarios[userIndex] = usuario
        // Guardo el usuario en la bdd
        await guardarUsuario(usuarios)

        res.json({
            mensaje: "Imagen de perfil subida exitosamente",
            imagen: nombreImagen
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al subir la imagen" })
    }
}