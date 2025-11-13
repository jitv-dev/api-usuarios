const express = require('express')
const fileUpload = require('express-fileupload');
const { expressjwt: expressJwt } = require('express-jwt')
require('dotenv').config()
const usuariosRouter = require('./src/routes/usuarios')

const app = express()
const PORT = 3000

app.use(express.json())
app.use(fileUpload())

// Protege todas las rutas excepto login y register
app.use(
    expressJwt({ secret: process.env.SECRET_KEY, algorithms: ['HS256'] })
        .unless({ path: ['/api/login', '/api/register'] })
)

app.use('/api', usuariosRouter)

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})