const { google } = require("googleapis");
const express = require("express");
const stream = require("stream");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const service = express();
const DRIVE_FOLDER_ID = ['1-sQEbClcbj6xmywa5XygM3wWfGCWWF69'];
const DRIVE_SCOPE = ['https://www.googleapis.com/auth/drive'];
const DRIVE_KEY_PATH = path.join( __dirname, 'GoogleKey.json' );
const MIDDLE = multer();
service.use( cors() );
service.set( "json spaces", 4 );
service.all("/", ( req, res ) => {
    res.json({
        code: 200,
        message: "Connection succeeded."
    })
});
service.post("/api/v1/image", MIDDLE.single("image"), async ( req, res ) => {
    try {
        const bufferStream = GetBuffer( req.file );
        const typed = path.extname( req.file.originalname );
        const auth = new google.auth.GoogleAuth({
            keyFile: DRIVE_KEY_PATH,
            scopes: DRIVE_SCOPE
        })
        const driveService = google.drive({
            version: 'v3',
            auth
        })
        const fileMetaData = {
            'name': new Date().getTime() + typed,
            'parents': DRIVE_FOLDER_ID
        }
        const media = {
            mimeType: req.file.mimetype,
            body: bufferStream
        }
        const response = await driveService.files.create({
            resource: fileMetaData,
            media: media,
            field: 'id'
        })
        await res.json({
            id: response.data.id,
            url: "https://drive.google.com/uc?id=" + response.data.id,
            name: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype
        })
    } catch ( err ) { res.json({ error:true,message:err }) }
});
function GetBuffer( file ) {
    const bufferStream = new stream.PassThrough();
    bufferStream.end( file.buffer );
    return bufferStream
}
service.listen( process.env.PORT || 5555 );
