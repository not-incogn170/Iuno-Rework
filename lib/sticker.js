const fs = require('fs')
const path = require('path')
const os = require('os')
const stream = require('stream')
const ffmpeg = require('fluent-ffmpeg')
const { createCanvas } = require('node-canvas')

async function fromImage(sock, jid, msg, downloadMediaMessage) {
    const tmpDir = os.tmpdir() 
    const tempFile = path.join(tmpDir, `sticker_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`)
    
    try{
        if(!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir, {recursive: true})
        }

        const buffer = await downloadMediaMessage(msg, 'buffer', {}, {})

        const bufferStream = new stream.PassThrough()
        bufferStream.end(buffer)

        ffmpeg(bufferStream)
            .inputFormat('image2pipe')
            .outputOptions([
                "-vf", "format=rgba,scale='if(gt(iw,ih),512,-1)':'if(gt(iw,ih),-1,512)',pad=512:512:(512-iw)/2:(512-ih)/2:color=0x00000000"
            ])
            .outputFormat('webp')
            .save(tempFile)
            .on('end', async () => {
                try{
                    await sock.sendMessage(jid, {sticker: fs.readFileSync(tempFile)}, {quoted: msg})
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

async function fromVideo(sock, jid, msg, downloadMediaMessage) {
    const tmpDir = os.tmpdir()
    const tempFile = path.join(tmpDir, `sticker_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`)
    
    try{
        if(!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir, {recursive: true})
        }

        const buffer = await downloadMediaMessage(msg, 'buffer', {}, {})

        const bufferStream = new stream.PassThrough()
        bufferStream.end(buffer)

        ffmpeg(bufferStream)
            .inputOptions(['-t 10.0'])
            .outputOptions([
                "-vcodec", "libwebp",
                "-vf", "fps=12,scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000",
                "-q:v", "20",
                "-lossless", "0",
                "-loop", "0",
                "-preset", "default",
                "-an",
                "-vsync", '0'
            ])
            .outputFormat('webp')
            .save(tempFile)
            .on('end', async () => {
                try{
                    await sock.sendMessage(jid, {sticker: fs.readFileSync(tempFile)}, {quoted: msg})
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

async function fromText(sock, jid, msg) {
    const canvas = createCanvas(512, 512)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Text
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    const lines = msg.text.split('\n')
    const lineHeight = 60
    const totalTextHeight = lines.length * lineHeight
    let y = (canvas.height - totalTextHeight) / 2 + lineHeight / 2

    for (const line of lines) {
        ctx.fillText(line, 20, y)
        y += lineHeight
    }

    const buffer = canvas.toBuffer('image/webp')
    await sock.sendMessage(jid, {sticker: buffer}, {quoted: msg})
}

module.exports = {
    fromImage,
    fromVideo,
    fromText
}
