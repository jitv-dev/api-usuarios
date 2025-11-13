const fs = require('fs').promises
const path = require('path')
const rutaArchivo = path.join(__dirname, '../data/usuarios.json')

async function leerUsuarios() {
    try {
        await fs.access(rutaArchivo)
        const data = await fs.readFile(rutaArchivo, 'utf8')
        return JSON.parse(data || '[]')
    } catch (error) {
        return []
    }
}

async function guardarUsuario(usuarios) {
    await fs.writeFile(rutaArchivo, JSON.stringify(usuarios, null, 4))
}
module.exports = { leerUsuarios, guardarUsuario }