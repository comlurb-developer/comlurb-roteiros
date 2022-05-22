const express = require('express');
var favicon = require('serve-favicon');
const path = require('path');
const PORT = process.env.PORT || '8080'

const app = express();

app.use(favicon(path.join(__dirname, 'src', 'favicon.ico')));

app.set("port", PORT);

// Serve only the static files form the dist directory
app.use(express.static('./dist/roteiro'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/roteiro/'}),
);

app.listen(PORT, () => {
    console.log('running');
})