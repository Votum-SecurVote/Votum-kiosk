const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

async function downloadFile(filename) {
    return new Promise((resolve, reject) => {
        const dest = path.join(modelsDir, filename);
        if (fs.existsSync(dest)) {
            console.log(`Skipping ${filename}, already exists.`);
            return resolve();
        }
        console.log(`Downloading ${filename}...`);
        const file = fs.createWriteStream(dest);
        https.get(baseUrl + filename, function(response) {
            if (response.statusCode >= 300) {
              reject(new Error(`Failed to get '${baseUrl + filename}' (${response.statusCode})`));
              return;
            }
            response.pipe(file);
            file.on('finish', function() {
                file.close(() => {
                    console.log(`Downloaded ${filename}`);
                    resolve();
                });
            });
        }).on('error', function(err) {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function main() {
    for (const file of files) {
        try {
            await downloadFile(file);
        } catch (err) {
            console.error(err);
        }
    }
    console.log('All downloads complete.');
}

main();
