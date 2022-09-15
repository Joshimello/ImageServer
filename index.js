const chokidar = require('chokidar')
const express = require('express')
const multer = require('multer')
const path = require('path')
const http = require('http')
const fs = require('fs')

const app = express()

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
    destination: (req, file, cb) => {
        cb(null, imageFolderPath)
    },
  
    filename: (req, file, cb) => {
        cb(null, count + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

app.post('/upload', upload.array('files'), (req, res) => {
    res.redirect('/');
})

app.get('/upload', (req, res) => {
    res.send(`
        <form id="form">
            <div class="row">
                <input class="u-full-width" id="files" type="file" multiple>
                <button class="u-full-width button-primary" type='$.sub();mit'>oh yea</button>
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
    image = images[Math.floor(Math.random()*images.length)]
    res.sendFile(path.join(__dirname, 'image', image))
})

app.listen(3003);