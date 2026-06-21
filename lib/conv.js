const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const path = require('path')
const os = require('os')
const stream = require('stream')

async function toimage(sock, jid, msg, downloadMediaMessage) {
    const mediaType = Object.keys(msg.message)[0]
    const tmpDir = os.tmpdir()
    const tempFile = path.join(tmpDir, `sticker_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`)
    
    try{
        if(!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir, {recursive: true})
        }

        const buffer = await downloadMediaMessage(msg, 'buffer', {}, {})

        const bufferStream = new stream.PassThrough()
        bufferStream.end(buffer)

        ffmpeg(bufferStream)
            .inputFormat('webp')
            .outputOptions([
                "-vf", "scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos"
            ])
            .outputFormat('png')
            .save(tempFile)
            .on('end', async () => {
                try{
                    await sock.sendMessage(jid, {image: fs.readFileSync(tempFile)}, {quoted: msg})
                }catch(sendError){
                    await sock.sendMessage(jid, {text: String(sendError)}, {quoted: msg})
                }finally{
                    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
                }
            })
            .on('error', async (err) => { 
                try{
                    await sock.sendMessage(jid, {text: String(err.message)}, {quoted: msg})
                }catch(e){
                    console.error(e)
                }
                if(fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
            })

    }catch(downloadError){
        await sock.sendMessage(jid, {text: String(downloadError)}, {quoted: msg})
        if(fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
    }
}

module.exports = { 
    toimage 
}