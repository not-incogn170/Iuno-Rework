const btch = require('btch-downloader')

async function downloadMedia(type, url) {
    const methodMap = {
        'fb': 'fbdown',
        'ig': 'igdl',
        'yt': 'youtube',
        'tt': 'ttdl',
        'x': 'twitter'
    }

    const methodName = methodMap[type]

    if (!methodName) {
        throw new Error(`Unsupported type: ${type}`);
    }

    try {
        const result = await btch[methodName](url);
        const video = 
            result.result?.[0]?.url ||
            result.HD ||
            result.Normal_video ||
            result.video?.[0] ||
            result.mp4 ||
            result.url?.[0]?.hd ||
            'unable to get video url'

        const audio = 
            result.audio?.[0] ||
            result.mp3 ||
            'unable to get audio url'

        const finalResult = `Video: ${video}\nAudio: ${audio}`;
        return finalResult
    }catch (err){
        console.error(`[Downloader Error] failed to download media from ${url} with type ${type}:`, err.message);
        throw err
    }
}

module.exports = {
    downloadMedia
}