const fs = require('fs');
const path = require('path');
const isBinary = require('isbinaryfile');

//const gulp = require('gulp');
const detectEncoding = require('detect-character-encoding');
const iconLite = require('iconv-lite');
const Iconv = require('iconv').Iconv;
const glob = require('glob');

const wwwPath = path.resolve(path.join(__dirname, 'www'));
let fileList = {};
let faultList = [];
let binaryFiles = [];
let nonBinaryFiles = [];


glob('www/public_html/**/!(*.gif|*.png|*.jpg|*.jpeg|*.mp4|*.JPG|*.bmp|*.ico|*.ttf|*.woff|*.woff2|*.eot|*.otf|*.swf|*.fla|*.pdf|*.p12|*.zip|*.pptx|*.db)', {nodir: true}, (error, files) => {
    const rootpath = path.resolve(process.cwd());

    files.map(file => {
        try {
            const filePath = path.join(rootpath, file);
            if(isBinary.sync(filePath)) {
                binaryFiles.push(filePath);
            } else {
                nonBinaryFiles.push(filePath);
            }
            const fileBuffer = fs.readFileSync(filePath);
            const encoding = detectEncoding(fileBuffer);

            if(!fileList.hasOwnProperty(encoding.encoding)) {
                fileList[encoding.encoding] = [];
            }

            fileList[encoding.encoding].push(filePath);
//            console.log(fileList);
        } catch (e) {
//            console.log(e);
            faultList.push(file);
        }
    });


//    for(let encode in fileList) {
//        if (encode !== 'UTF-8') {
//            let encoding = encode === "ISO-8859-1" ? 'latin1' : encode;
//
//            const iconv = new Iconv(encoding, 'UTF-8');
//            fileList[encode].map((file) => {
//                var buffer = fs.readFileSync(file);
//
//                const stream = fs.createReadStream(file)
//                    .pipe(iconLite.decodeStream(encoding))
//                    .pipe(iconLite.encodeStream('UTF-8'))
//                    .pipe(fs.createWriteStream(file));
//
//                stream.write(iconv.convert(buffer).toString('utf-8'));
//
//            });
//        }
//    }
//    fileList.map((files) => {
//        console.log(files);
//    });
//    console.log(fileList);
    fs.writeFileSync(path.join(rootpath, 'list.json'), JSON.stringify(fileList, null, '  '));
    fs.writeFileSync(path.join(rootpath, 'encodes.json'), JSON.stringify(Object.keys(fileList), null, '  '));
    fs.writeFileSync(path.join(rootpath, 'binaryFiles.json'), JSON.stringify(binaryFiles, null, '  '));
    fs.writeFileSync(path.join(rootpath, 'nonBinaryFiles.json'), JSON.stringify(nonBinaryFiles, null, '  '));
});