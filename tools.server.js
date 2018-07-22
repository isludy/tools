const fs = require('fs');
const path = require('path');
const os = require('os');
const {exec} = require('child_process');
const config = require('./tools.config');

let www = path.join(__dirname, (config.output || 'dist')),
    port = 3000,
    lh;

try {
    let network = os.networkInterfaces();
    lh = network[Object.keys(network)[0]][1].address;
} catch (e) {
    lh = 'localhost';
}
if(!fs.existsSync(www)){
    fs.writeFileSync(path.join(www,'index.html'),
`<!DOCTYPE html>
<html lang="zh-cn">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
        <title>常用工具-组件</title>
    </head>
    <body>
        <h1>常用工具-组件</h1>
    </body>
</html>`);
}

exec('http-server '+www+' -p '+port+' -o -c-1', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});

