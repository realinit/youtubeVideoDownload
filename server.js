const express = require("express");
const fs = require("fs");
const app = express();
const ytdl = require("ytdl-core");
const {getSubtitles} = require("./index");
const { DownloaderHelper } = require('node-downloader-helper');
  
  app.set('view engine', 'ejs');
  app.set('view options', {
      layout: false
  });
// OUR ROUTES WILL GO HERE
app.get("/", (req, res) => {
	return res.render("index");
});

app.get("/download", async (req, res) => {
	const v_id = req.query.url.split('v=')[1];
    const capRes = await getSubtitles({videoID:v_id});
        if(!capRes){
            return res.render("download", {
                message: 'No Caption found for this video ',
            });
        }
    const info = await ytdl.getInfo(req.query.url);
    const video  = info.formats.filter(format=>format.qualityLabel == "1080p" && format.mimeType.includes('video/mp4'))
    // console.log("info.formats  ",info.formats.filter(format=>format.qualityLabel == "1080p"));
    const [firstData] = video
    const {url,itag} = firstData;
    const dl = await new DownloaderHelper(url,__dirname,{
        fileName:`Video_${itag}.mp4`
    });
    dl.on('end', () => console.log('Download Completed'));
    dl.on('error', (err) => console.log('Download Failed', err));
    dl.start().catch(err => console.error(err));
	return res.render("download", {
		message: " File download from this url : - https://www.youtube.com/embed/" + v_id,
	});
});
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});