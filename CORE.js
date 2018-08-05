const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const info = {
    entry: [],
    output: [],
    mount: []
};
const reg = {
    comment: /\/\*[\s\S]*?\*\/|\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]/g,
    oKeyValue: /(?<=(\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]|\/\*[\s\S]*?\*\/[\r\n\u2028\u2029]*|^)\s*)[a-zA-Z$_][\w$]*$/,
    oFunction: /(?<=(\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]|\/\*[\s\S]*?\*\/[\r\n\u2028\u2029]*|^)\s*)[a-zA-Z$_][\w$]*(?=\s*\([^()]*?\))/,
    imports: /import([\s\S]+?)from[\s\n\r]+['"]([^'"]+?)['"][;\s\r\n]*|(?:const|let|var)([\s\S]+?)=\s*require\s*\(\s*['"]([^'"]*?)['"]\s*\)[;\s\r\n]*/g,
    exports: /export\s+default\s+|(module\.)*exports\s*=/g,
    utilsImport: /(?:import\s+utils\s+from\s*(['"])[^\1]+?\1|(?:const|let|val)\s+utils\s*=\s*require\([^)]*?\))[;\s\r\n\u2028\u2029]+/g
};

const fns = {
    /**
     * 获取最外层的指定成对符号如{}()[]
     * @param code
     * @param start 起始符号
     * @param end 结束符号
     * @param bool boolean,决定往start符号前、后取值，默认false，表示往后取
     * @returns {{space: number, code: *}}
     */
    getPairOf(code, start, end, bool = false) {
        let len = code.length,
            i = 0,
            count = 0,
            pre = 0,
            index = 0,
            space = 0;
        for (; i < len; i++) {
            index = bool ? (len - i) : i;
            if (code[index] === start) {
                count++;
                if (count === 1) {
                    pre = index;
                    space = i;
                }
            } else if (code[index] === end) {
                count--;
                if (count === 0) {
                    return {
                        space,
                        code: bool ? code.slice(len - i, pre + 1) : code.slice(pre, i + 1)
                    };
                }
            }

        }
    },
    /**
     * 处理 object{ item, fn(){}, ... } 为 array[ 'item: item', 'item: function(){}', ...]
     * 返回数组给下一步处理
     * @param code
     * @returns {Map}
     */
    obj2Array(code) {
        let arr = new Map(),
            count = 0,
            pre = 0,
            start,
            end,
            len,
            isLast;

        code = code.trim().slice(1, -1);
        len = code.length;

        for (let i = 0; i < len; i++) {
            if (!start && (code[i] === '{' || code[i] === '(' || code[i] === '[')) {
                start = code[i];
                switch (start) {
                    case '{':
                        end = '}';
                        break;
                    case '[':
                        end = ']';
                        break;
                    case '(':
                        end = ')';
                        break;
                }
            }
            if (code[i] === start) {
                count++;
            } else if (code[i] === end) {
                count--;
            }
            if (count === 0) {
                start = '';
            }
            isLast = i === len - 1;
            if (!start && (code[i] === ',' || isLast)) {
                let v = code.slice(pre, (isLast ? i + 1 : i)).trim(),
                    match;
                if (match = reg.oKeyValue.exec(v)) {
                    arr.set(match[0], match[0]);
                } else if (match = reg.oFunction.exec(v)) {
                    arr.set(v.slice(0, match.index) + match[0], 'function' + v.slice(match.index + match[0].length));
                }else{
                    arr.set(v.slice(0, v.indexOf(':')), v.slice(v.indexOf(':')+1));
                }
                pre = i + 1;
            }
        }
        return arr;
    },
    utils(filename){
        let code = fs.readFileSync(filename, 'utf8').replace(reg.comment, ''),
            o = fns.getPairOf(code, '{', '}');
        return fns.obj2Array(o.code);
    },
    mountCode(mount, name, filename){
        if(mount){
            mount = mount !== 'window' ? 'window.'+mount : mount;
        }else{
            mount = 'window';
        }
        let str = 'if(!'+mount+')'+mount+'={};\n'+mount+(name ? '.'+name : '')+' = ';
        info.mount.push(mount+(name ? '.'+name : ''));
        if(fs.existsSync(filename)){
            return fs.readFileSync(filename, 'utf8').replace(reg.exports, str);
        }else{
            return filename.replace(reg.exports, str);
        }
    },
    /**
     * 把用到的utils添加到map中
     * @param filename
     * @param map
     */
    findUtilsFun(filename, map){
        map = map || new Map();
        function re(code){
            let reg = /utils(?:\.([\w$]*)|\[\s*(['"]?)(.*?)\2\s*])/g,
                matchKey;

            while(matchKey = reg.exec(code)){
                matchKey = matchKey[1] || matchKey[3];
                if(!map.has(matchKey) && utils.has(matchKey) ) {
                    map.set(matchKey, utils.get(matchKey));
                }
            }

            map.forEach(item=>{
                while (matchKey = reg.exec(item)){
                    matchKey = matchKey[1] || matchKey[3];
                    if(!map.has(matchKey)){
                        re(item);
                    }
                }
            });
        }
        if(fs.existsSync(filename)){
            re(fs.readFileSync(filename, 'utf8'));
        }else{
            re(filename);
        }
    },
    eachFile(dir, exclude, callback){
        if(typeof exclude === 'function'){
            callback = exclude;
            exclude = /node_module|\..*/g;
        }else{
            exclude = (exclude instanceof RegExp) ? exclude : /node_module|\..*/g;
        }

        function fileDisplay(filePath){
            let files = fs.readdirSync(filePath);

            files.forEach(function(filename) {
                let filedir = path.join(filePath, filename);
                let stats = fs.statSync(filedir);
                if (stats.isFile()) {
                    if (callback) callback(filedir);
                }
                if (stats.isDirectory() && !exclude.test(filedir)) {
                    fileDisplay(filedir);
                }
            });
        }
        fileDisplay(__dirname);
    },
    clearTemp(tempReg){
        fns.eachFile(__dirname, (temp)=>{
            if(tempReg.test(temp)){
                try {
                    fs.unlinkSync(temp);
                }catch (e) {

                }
            }
        });
    },
    createDemo(files, opt){
        let reg = /<(style|template|script)[^>]*?>([\s\S]*?)<\/\1>/g,
            style = [],
            html = [],
            script = [],
            code,
            match,
            mounts = {};
        opt.mount.forEach(item=>{
            if(/\./.test(item)){
                mounts[item.slice(item.lastIndexOf('.')+1)] = item;
            }
        });
        files.forEach(file=>{
            if(fs.existsSync(file)){
                let tool = path.dirname(file).split(/[\/\\]+/);
                tool = tool[tool.length - 1];
                code = fs.readFileSync(file, 'utf8');
                while(match = reg.exec(code)){
                    switch (match[1]){
                        case 'style':
                            if(match[2]) style.push(match[2]);
                            break;
                        case 'template':
                            if(match[2]) html.push(match[2]);
                            break;
                        case 'script':
                            if(match[2]) script.push('(function(){\n    var '+tool+' = '+mounts[tool]+';\n'+match[2]+'\n})();');
                            break;
                    }
                }
            }
        });
        fs.writeFileSync(path.join(opt.dist,'index.html'),
`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Tools</title>
    <link rel="stylesheet" href="${opt.css}">
    <style>
    ${style.join('\n')}
    </style>
</head>
<body>
${html.join('\n')}
<script src="${opt.script}"></script>
<script>
${script.join('\n')}
</script>
</body>
</html>`
        );

    }
};

const toolConfig = require('./tools.config');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const utilsSourcePath = path.join(__dirname,'utils','utils.js');
const utils = fns.utils(utilsSourcePath);

const config = {
    entry: {},
    mode: process.argv[2] || 'production',
    output: {
        filename: toolConfig.filename+'.js' || '[name].js',
        path: path.join(__dirname, (toolConfig.output || 'dist'))
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, use: "babel-loader"},
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [{loader: MiniCssExtractPlugin.loader}, "css-loader"]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: (toolConfig.filename || 'tools')+'.css',
            chunkFilename: "[id].css"
        })
    ]
};

let mount = toolConfig.mount ||  'window',
    tempname = 'TOOL_TEMP.JS',
    tempReg = new RegExp(tempname.replace('.','\\.'),'g'),
    argv3 = process.argv[3];


if(process.argv[2] === 'clear') {
    fns.clearTemp(tempReg);
    console.log('\x1b[32m %s \x1b[0m', 'All is cleared');
    return;
}

if(argv3 === '*' || argv3 === '.'){
    let usedUtilsMap = new Map(),
        thisTempOut,
        uTempOut = path.join(__dirname, 'utils', tempname),
        uOutCode = [],
        code;
    config.entry = [];
    toolConfig.tools.forEach(tool=>{
        thisTempOut = path.join(__dirname, 'src', tool, tempname);
        code = fs.readFileSync(path.join(__dirname, 'src', tool, tool+'.js'), 'utf8').replace(reg.utilsImport, 'const utils = require("../../utils/'+tempname+'");\n');
        fns.findUtilsFun(code, usedUtilsMap);
        fs.writeFileSync(thisTempOut, fns.mountCode(mount, tool, code));
        info.entry.push('./src/'+tool+'/'+tool+'.js');
        config.entry.push(thisTempOut);
    });

    usedUtilsMap.forEach((val, key)=>{
        uOutCode.push(key+': '+val);
    });

    fs.writeFileSync(uTempOut,'const utils = {\n' + uOutCode.join(',') + '\n}; module.exports = utils;' );
}else if(toolConfig.tools.includes(argv3)){
    let thisToolPath = path.join(__dirname, 'src', argv3),
        thisTempOut = path.join(thisToolPath, tempname),
        uTempOut = path.join(__dirname, 'utils', tempname),
        uMap = new Map(),
        uOutCode = [],
        code = fs.readFileSync(path.join(thisToolPath, argv3+'.js'),'utf8');

    fns.findUtilsFun(code, uMap);
    uMap.forEach((val, key)=>{
        uOutCode.push(key+': '+val);
    });

    fs.writeFileSync(thisTempOut, fns.mountCode(argv3, '', code.replace(reg.utilsImport, 'const utils = require("../../utils/'+tempname+'");\n')) );
    fs.writeFileSync(uTempOut, 'const utils = {\n' + uOutCode.join(',') + '\n}; module.exports = utils;');
    config.entry = thisTempOut;
    info.entry.push('./src/'+argv3+'/'+argv3+'.js');
}else{
    if(argv3){
        console.log('\x1b[32m %s \x1b[0m', '指令npm run '+(config.mode === 'production'?'build':'dev')+' '+argv3+'有误，找不到“'+argv3+'”，若已创建，请将它添加到tools.config.js中的tools里');
        return;
    }
    let tempOut = path.join(path.dirname(utilsSourcePath),tempname);
    fs.writeFileSync(tempOut, fns.mountCode(mount, '', utilsSourcePath));
    config.entry = tempOut;
    info.entry.push('./utils/utils.js');
}

webpack(config, (err, state)=>{
    if(err){
        console.log(err);
    }else{
        let demoFiles = [],
            assets = Object.keys(state.compilation.assets),
            script,
            css;
        info.entry.forEach(entry=>{
            demoFiles.push(path.join(__dirname, path.dirname(entry), 'demo.html'));
        });
        assets.forEach(item=>{
            if(/\.css$/.test(item)){
                css = item;
            }
            if(/\.js$/.test(item)){
                script = item;
            }
        });
        fns.createDemo(demoFiles, {
            dist: toolConfig.output || 'dist',
            script,
            css,
            mount: info.mount
        });
        console.log('\x1B[32m %s \x1B[0m', 'success');
        console.log('\x1b[32m %s \x1b[0m', 'entry: ');
        console.log(info.entry);
        console.log('\x1b[32m %s \x1b[0m', 'output: ');
        console.log(assets);
        console.log('\x1b[32m %s \x1b[0m', 'mount: ');
        console.log(info.mount);
    }
    fns.clearTemp(tempReg);
    try{
        fs.unlinkSync('./TOOLS.TEMP');
    }catch (e) {}
});
