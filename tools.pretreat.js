const fs = require('fs');
const path = require('path');
const utils = require('./utils/utils');
const webpack = require("webpack");
const argv = process.argv;
const toolsConfig = require('./tools.config');
const fnMap = new Map();
const tempTime = 'temp'+(new Date()).getTime();
const temputils = path.join(__dirname, 'temputils'+tempTime+'.js');
const defaults = {
    name: 'Tools.min',
    path: './dist'
};
const defaultMount = toolsConfig.mount || 'window';
const tempFiles = new Map();

const regImport = /(import\s+utils\s+from\s+\S+\s+)|((let|const|var)\s+utils\s*=\s*require\([^)]*?\)\s*[;]*\s+)/g;
const regExport = /export\s+default\s+/g;
const regModule = /(?:module\.)*exports\s*=\s*/g;
const regUtils = /utils\.\w+/g;

const config = {
    entry: {},
    mode: argv[2] || 'production',
    output: {
        filename: '[name].min.js',
        path: __dirname
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: ['babel-loader']
        }]
    }
};

function findUtils(data){
    let fns = data.toString().match(regUtils);
    if(Array.isArray(fns))
        fns.forEach(v=>{
            let name = v.slice(6);
            if(utils[name]){
                fnMap.set(name, utils[name]);
                findUtils(utils[name]);
            }
        });
}

function writeEntryFile(folder, merge=false){
    let backArr = [];
    try{
        let writePath = path.join(__dirname, folder, tempTime+'.js'),
            item = toolsConfig.group[folder],
            name = item.name || folder,
            data = fs.readFileSync(path.join(__dirname, folder, item.entry+'.js')),
            sourceCode = data.toString().replace(regImport,'');

        sourceCode = sourceCode.replace(regModule, function(){
            return defaultMount+'.' + name + '=';
        });

        sourceCode = sourceCode.replace(regExport, function(){
            return defaultMount+'.' + name + '=';
        });

        findUtils(data);

        if(merge){
            fs.writeFileSync(
                temputils,
                'export default {\n\t'+Array.from(fnMap.values()).join(',\n\t')+'\n};'
            );
            fs.writeFileSync(writePath, 'import utils from "'+temputils+'";\n'+sourceCode);
            backArr[0] = writePath;
        }else{
            fs.writeFileSync(writePath, 'const utils = {\n\t'+Array.from(fnMap.values()).join(',\n\t')+'\n};\n'+sourceCode);
            backArr[0] = path.join('/'+folder, 'dist', name);
            backArr[1] = writePath;
        }
    }catch (err){
        throw new Error(err.message);
    }
    return backArr;
}

function writeEntryFiles(directive, callback){
    if(!toolsConfig.group){
        toolsConfig.group = {};
    }
    if(!toolsConfig.merge){
        toolsConfig.merge = defaults;
    }else if(typeof toolsConfig.merge === 'object'){
        for(let k in toolsConfig.merge){
            defaults[k] = toolsConfig.merge[k];
        }
    }

    switch (directive){
        case 'every':
            for(let folder in toolsConfig.group) {
                let arr = writeEntryFile(folder);
                config.entry[arr[0]] = arr[1];
                tempFiles.set(arr[0], arr[1]);
            }
            break;
        case 'current':
            if(argv[4]){
                if(toolsConfig.group[argv[4]]){
                    let arr = writeEntryFile(argv[4]);
                    config.entry[arr[0]] = arr[1];
                    tempFiles.set(arr[0], arr[1]);
                }else{
                    console.error('\x1B[31m%s\x1b[0m', '\tERROR：在配置中未找到名为“'+argv[4]+'”的组件。');
                    return;
                }
            }else{
                let modestr = config.mode === 'development' ? 'dev-c' : 'build-c';
                console.error('\x1B[31m%s\x1b[0m', '\tERROR：命令 “npm run '+modestr+'” 后必须传入要处理的文件夹名作为参数！例如：npm run '+modestr+' Player');
                return;
            }
            break;
        case 'merge':
            config.entry = [];
            for(let folder in toolsConfig.group) {
                let arr = writeEntryFile(folder, true);
                config.entry.push(arr[0]);
                tempFiles.set(folder, arr[0]);
            }
            config.output.filename = defaults.name+'.js';
            config.output.path = path.join(__dirname, defaults.path);
            tempFiles.set('temputils', temputils);
            break;
    }
    callback();
}

function deleteTemp(){
    tempFiles.forEach(tempFile=>{
        fs.stat(tempFile, (err, stats)=>{
            if(err){
                console.log('\x1B[31m%s\x1b[0m', err.message);
            }else{
                if(stats.isFile()){
                    try{
                        fs.unlinkSync(tempFile);
                    }catch(err1){
                        console.log('\x1B[31m%s\x1b[0m', err.message);
                    }
                }
            }
        });
    });
}

function webpackCalback(err){
    if(err){
        console.log('\x1B[31m%s\x1b[0m', err.message);
    }else{
        if(argv[3] === 'merge'){
            console.log(
                '\x1B[33m--| %s\x1b[0m => \x1B[32m%s\x1b[0m',
                config.entry.join(' & \n--| '),
                path.join(config.output.path, config.output.filename));
        }else{
            for(let key in config.entry){
                console.log('\x1B[33m--| %s\x1b[0m => \x1B[32m%s\x1b[0m', config.entry[key].replace(/[^\\\/]*?$/g,'')+'main.js', path.join(__dirname, key+'.min.js'));
            }
        }
    }
    deleteTemp();
}
writeEntryFiles(argv[3], ()=>{
    webpack(config, webpackCalback);
});
