const express = require('express')
const expressHb = require('express-handlebars')
const fs = require('fs').promises
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const PORT = 8080
app.use(express.json())
app.engine('handlebars', expressHb())
app.set('view engine', 'handlebars')

io.on('connection', (socket) => {
    console.log('Se conectó un usuario')
});

app.get('/', async (req, res) => {
    try {
        const data = await fs.readFile('productos.json', 'utf8')
        const productos = JSON.parse(data)
        res.render('home', { title: 'Home', productos })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Hubo un error al obtener los productos' })
    }
})

app.get('/realtimeproducts', async (req, res) => {
    try {
        const data = await fs.readFile('productos.json', 'utf8')
        const productos = JSON.parse(data)
        res.render('realTimeProducts', { title: 'Real Time Products', productos })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Hubo un error al obtener los productos' })
    }
})

app.post('/api/products', async (req, res) => {
    const newProduct = req.body
    try {
        const data = await fs.readFile('productos.json', 'utf8')
        let productos = JSON.parse(data)
        newProduct.id = productos.length + 1
        productos.push(newProduct)
        await fs.writeFile('productos.json', JSON.stringify(productos, null, 2))
        io.emit('productAdded', newProduct)
        res.status(201).json({ message: 'Producto agregado correctamente', producto: newProduct })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Hubo un error al agregar el producto' })
    }
})

http.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
