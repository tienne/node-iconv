const fs = require('fs');
const path = require('path');
const isBinary = require('isbinaryfile');

//const gulp = require('gulp');
const detectEncoding = require('detect-character-encoding');
const Iconv = require('iconv').Iconv;
const glob = require('glob');

const wwwPath = path.resolve(path.join(__dirname, 'www'));
let fileList = {};
let faultList = [];
let binaryFiles = [];
let nonBinaryFiles = [];


glob('www/public_html/_chk/**/!(*.gif|*.png|*.jpg|*.jpeg|*.mp4|*.JPG|*.bmp|*.ico|*.ttf|*.woff|*.woff2|*.eot|*.otf|*.swf|*.fla|*.pdf|*.p12|*.zip|*.pptx|*.db)', {nodir: true}, (error, files) => {
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

    for(let encode in fileList) {
        if (encode !== 'UTF-8') {
            const iconv = new Iconv(encode, 'UTF-8');
            fileList[encode].map((file) => {
                var buffer = fs.readFileSync(file);
                fs.writeFileSync(file, iconv.convert(buffer));
//                    .pipe(iconv.decodeStream(encode))
//                    .pipe(iconv.encodeStream('UTF-8', {stripBOM: false}))
//                    .pipe(fs.createWriteStream(file));
            });
        }
    }
//    fileList.map((files) => {
//        console.log(files);
//    });
//    console.log(fileList);
    fs.writeFileSync(path.join(rootpath, 'list.json'), JSON.stringify(fileList, null, '  '));
    fs.writeFileSync(path.join(rootpath, 'encodes.json'), JSON.stringify(Object.keys(fileList), null, '  '));
    fs.writeFileSync(path.join(rootpath, 'binaryFiles.json'), JSON.stringify(binaryFiles, null, '  '));
    fs.writeFileSync(path.join(rootpath, 'nonBinaryFiles.json'), JSON.stringify(nonBinaryFiles, null, '  '));
});