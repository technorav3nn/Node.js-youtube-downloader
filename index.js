const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const util = require('util');
const app = express();

app.use(express.urlencoded({
  extended: true
}));

app.use('/videos', express.static('./public'));

const port = process.env.port || 3000
app.get('/', (req, res) => {
    res.sendFile(`index.html`, {
      root: `./` });
})

app.post('/api/downloader/', (req, res) => {
  const url = req.body.url;
  const rand = Math.floor(Math.random() * 100)
  if(rand === 1) rand++

  try {
    ytdl(url)
    .pipe(
      fs.createWriteStream(`./public/video${rand}.mp4`)
    );
    res.sendFile(`video${rand}.mp4`, { root: './public'})
  } catch(err) {
    res.send({error: err})
  }

})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
})