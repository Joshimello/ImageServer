const express = require('express')
const fileUpload = require('express-fileupload')
const uniqueFilename = require('unique-filename')
const chokidar = require('chokidar')
const fs = require('fs')
const app = express()
app.use(fileUpload())

fs.existsSync('./image/') ? null : fs.mkdirSync('./image/')

app.post('/upload', function(req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.')
    }

    if (req.files) {
        if (req.files.file.length > 1) {
            let promises = []
            for (let i = 0; i < req.files.file.length; i++) {
                promises.push(new Promise(resolve => {
                    req.files.file[i].mv(`${uniqueFilename('./image/')}.${req.files.file[i].mimetype.split('/')[1]}`, (err) => {
                        err ? res.send(err) : resolve()
                    })
                }))
            }

            Promise.all(promises).then(() => {
                res.redirect('/')
            })
        }

        else {
            req.files.file.mv(`${uniqueFilename('./image/')}.${req.files.file.mimetype.split('/')[1]}`, (err) => {
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

var images = []
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