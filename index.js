const express = require('express')
const fileUpload = require('express-fileupload')
const chokidar = require('chokidar')
const fs = require('fs')
const app = express()

app.use(fileUpload())

var images = []
var count = 0

fs.existsSync('./image/') ? null : fs.mkdirSync('./image/')

fs.readdir('./image/', (err, files) => {
    count = files.length
})

app.post('/upload', function(req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.')
    }

    if (req.files) {
        if (req.files.file.length > 1) {
            let promises = []
            for (let i = 0; i < req.files.file.length; i++) {
                count++
                promises.push(new Promise(resolve => {
                    req.files.file[i].mv(`./image/${count}.${req.files.file[i].mimetype.split('/')[1]}`, (err) => {
                        err ? res.send(err) : resolve()
                    })
                }))
            }

            Promise.all(promises).then(() => {
                res.redirect('/')
            })
        }

        else {
            count++
            req.files.file.mv(`./image/${count}.${req.files.file.mimetype.split('/')[1]}`, (err) => {
                err ? res.send(err) : res.redirect('/')
            })
        }
    }
})

app.get('/upload', (req, res) => {
    res.send(`
        <form ref='uploadForm' 
            id='uploadForm' 
            action='/upload' 
            method='post' 
            encType="multipart/form-data">
            
            <input type="file" name="file" multiple />
            <input type='submit' value='uwu' />
        </form>
    `)
})

const watcher = chokidar.watch(__dirname + '/image/', {
    persistent: true,
    cwd: __dirname + '/image/'
})

watcher.on('add', path => {
    images.push(path)
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/image/' + images[Math.floor(Math.random()*images.length)])
})

app.get('/img/:file', (req, res) => {
    res.sendFile(__dirname + '/image/' + req.params.file)
})

app.get('/api', (req, res) => {
    res.json(images)
})

app.get('/all', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


app.listen(3003)