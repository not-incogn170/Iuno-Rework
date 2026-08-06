const btch = require('btch-downloader')

async function downloadMedia(url, type) {
    const methodMap = {
        'yt' : 'youtube',
        'tt' : 'ttdl',
        'ig' : 'igdl',
        'fb' : 'fbdown',
        'tw' : 'twitter',
    }

    const methodName = methodMap[type];
    if (!methodName) {
        throw new Error(`Unsupported type: ${type}`);
    }

    try {
        const result = await btch[methodName](url);
        const video = 
            result.result?.[0]?.url ||
            result.HD ||
            result.Normal_video ||
            result.mp4 ||
            result.video ||
            result.url?.[0]?.hd ||
            'unable to get video url';

        const audio = 
            result.result?.[0]?.audio ||
            result.audio ||
            result.mp3 ||
            'unable to get audio url';
    }catch (err){
        console.error(`[Downloader Error] failed to download media from ${url} with type ${type}:`, err.message);
        throw err
    }
}

module.exports = {
    downloadMedia
}