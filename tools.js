const fs = require('fs');
const path = require('path');
const utils = require('./utils/utils');
const webpack = require("webpack");

function writeEntryFile(name, writePath){
    try{
        let data = fs.readFileSync(path.join(__dirname, name, 'main.js'));
        let fns = data.toString().match(/utils\.\w+/g);
        let fnMap = new Map();
        fns.forEach(v=>{
            let name = v.slice(6);
            if(utils[name]){
                fnMap.set(name, utils[name]);
            }
        });
        fs.writeFileSync(
            writePath,
            'const utils = {\n\t'+Array.from(fnMap.values()).join(',\n\t')+'\n};\n'+data.toString().replace(/(import\s+utils\s+from\s+\S+\s+)|((let|const)\s+utils\s*=\s*require\([^)]*?\)\s*[;]*\s+)/g,'')
        );
    }catch (err){
        throw err.message;
    }
}

function writeEntryFiles(arr){
    let entry = {};
    arr.forEach(name=>{
        let writePath = path.join(__dirname, name, name+'.js');
        entry[path.join('/'+name, 'dist', name)] = writePath;
        writeEntryFile(name, writePath);
    });
    return entry;
}


const config = {
    mode: process.argv[3] || 'production',
    output: {
        filename: '[name].min.js',
        path: __dirname
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },{
            test: /\.js$/,
            use: ['babel-loader']
        }]
    }
};

config.entry = writeEntryFiles(['PageSlide', 'Player']);

webpack(config, (err)=>{
    if(err){
        console.log('\x1B[31m%s\x1b[0m', err.message);
    }else{
        for(let key in config.entry){
            console.log('\x1B[33m%s\x1b[0m => \x1B[32m%s\x1b[0m', config.entry[key].replace(/[^\\\/]*?$/g,'')+'main.js', key+'.min.js');
        }
        console.log('\x1B[32m%s\x1b[0m', 'success!');
    }
    for(let key in config.entry){
        (function(epath){
            fs.stat(epath, (err, stats)=>{
                if(err){
                    console.log('\x1B[31m%s\x1b[0m', err.message);
                }else{
                    if(stats.isFile()){
                        try{
                            fs.unlinkSync(epath);
                        }catch(err1){
                            console.log('\x1B[31m%s\x1b[0m', err.message);
                        }
                    }
                }
            });
        })(config.entry[key]);
    }
});