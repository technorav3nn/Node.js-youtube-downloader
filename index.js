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
    res.redirect('/api/video?name=video'+rand+'.mp4')
  } catch(err) {
    res.send({error: err})
  }
})

app.get('/api/video', (req, res) => {
  const videoName = req.query.name
  const videoPath = `./public/${videoName}`
  if(!videoName) {
    res.send({error: 'enter name'})
    return
  }
  try {
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const videoRange = req.headers.range;
    if (videoRange) {
        const parts = videoRange.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1;
        const chunksize = (end-start) + 1;
        const file = fs.createReadStream(videoPath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
    // res.sendFile(videoPath, {root : './'})
  } catch(err) {
    res.send({error :'That file doesnt exist!'})
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
})
