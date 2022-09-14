const chokidar = require('chokidar')
const express = require('express')
const multer = require('multer')
const path = require('path')
const http = require('http')
const fs = require('fs')

const app = express()
const server = http.createServer(app)

count = 0
images = []
imageFolderPath = path.join(__dirname, 'image')
fs.existsSync(imageFolderPath) ? null : fs.mkdirSync(imageFolderPath)

const watcher = chokidar.watch(imageFolderPath, {
    persistent: true,
    cwd: imageFolderPath
})

watcher.on('add', path => {
    images.push(path)
    count++
})

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, imageFolderPath)
    },
  
    filename: function(req, file, cb) {
        cb(null, count + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

app.post('/upload', upload.array('files'), (req, res) => {
    res.json({ message: 'Successfully uploaded files' })
})

app.get('/upload', (req, res) => {
    res.send(`
        <form id="form">
            <div class="row">
                <input class="u-full-width" id="files" type="file" multiple>
                <button class="u-full-width button-primary" type='submit'>oh yea</button>
            </div>
        </form>

        <script>
            const form = document.getElementById("form");

            form.addEventListener("submit", submitForm);

            function submitForm(e) {
                e.preventDefault()
                const formData = new FormData()
                const files = document.getElementById("files")
                for(let i =0; i < files.files.length; i++) {
                    formData.append("files", files.files[i])
                }
                fetch('/upload', {
                    method: 'POST',
                    body: formData,
                })
                .then(() => {
                    window.location.replace('/')
                })
            }
        </script>
    `)
})

app.get('/', (req, res) => {
    res.sendFile(images[Math.floor(Math.random()*images.length)], { root: imageFolderPath })
})

const PORT = 3001 || process.env.PORT

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))