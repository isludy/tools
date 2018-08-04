const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const toolConfig = require('./tools.config');

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
        name = name ? '.'+name : '';
        mount = /^window/.test(mount) ? mount+name+' = ' : 'window.'+mount+name+' = ';
        if(fs.existsSync(filename)){
            return fs.readFileSync(filename, 'utf8').replace(reg.exports, mount);
        }else{
            return filename.replace(reg.exports, mount);
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
            let reg = /utils(?:\.([\w$_][\w\d$_]*)|\[\s*(['"]?)(.*?)\2\s*])/g,
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
        return map;
    }
};
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
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
            {test: /\.css$/, exclude: /node_modules/, loader: ['style-loader', 'css-loader']}
        ]
    }
};
const tempFiles = [];

let mount = toolConfig.mount ||  'window',
    timestamp = new Date().getTime(),
    argv3 = process.argv[3];


if(argv3 === '*' || argv3 === '.'){
    let usedUtilsMap = new Map(),
        thisTempOut,
        uTempOut = path.join(__dirname, 'utils', 'utils'+timestamp+'.js'),
        uOutCode = [],
        code;
    config.entry = [];
    toolConfig.tools.forEach(tool=>{
        thisTempOut = path.join(__dirname, 'src', tool, tool+timestamp+'.js');
        code = fs.readFileSync(path.join(__dirname, 'src', tool, tool+'.js'), 'utf8').replace(reg.utilsImport, 'import utils from "../../utils/'+path.basename(uTempOut)+'";\n');
        fns.findUtilsFun(code, usedUtilsMap);
        fs.writeFileSync(thisTempOut, fns.mountCode(mount, tool, code));
        tempFiles.push(thisTempOut);
        config.entry.push(thisTempOut);
    });

    usedUtilsMap.forEach((val, key)=>{
        uOutCode.push(key+': '+val);
    });

    fs.writeFileSync(uTempOut,'export default {\n' + uOutCode.join(',') + '\n}' );
    tempFiles.push(uTempOut);
}else if(toolConfig.tools.includes(argv3)){
    let thisToolPath = path.join(__dirname, 'src', argv3),
        thisTempOut = path.join(thisToolPath, argv3+timestamp+'.js'),
        uTempOut = path.join(thisToolPath, 'utils'+timestamp+'.js'),
        uMap,
        uOutCode = [],
        code = fs.readFileSync(path.join(thisToolPath, argv3+'.js'),'utf8');

    uMap = fns.findUtilsFun(code);
    uMap.forEach((val, key)=>{
        uOutCode.push(key+': '+val);
    });

    fs.writeFileSync(thisTempOut, fns.mountCode(argv3, '', code.replace(reg.utilsImport, 'import utils from "./'+path.basename(uTempOut)+'";\n')) );
    tempFiles.push(thisTempOut);
    fs.writeFileSync(uTempOut, 'export default {\n' + uOutCode.join(',') + '\n}');
    tempFiles.push(uTempOut);
    config.entry = thisTempOut;
}else{
    let tempOut = path.dirname(utilsSourcePath)+'/utils'+timestamp+'.js';
    fs.writeFileSync(tempOut, fns.mountCode(mount, '', utilsSourcePath));
    tempFiles.push(tempOut);
    config.entry = tempOut;
}
console.log(config);

webpack(config, (err)=>{
    if(err){
        console.log(err);
    }
    try{
        tempFiles.forEach(tempFile=>{
            fs.unlinkSync(tempFile);
        });
    }catch(e){}
});
