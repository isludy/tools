const fs = require('fs');
const path = require('path');
const basePath = path.join(__dirname, 'src');
const utils = require('./utils/utils');

const importReg = /import([\s\S]+?)from[\s\n\r]+['"]([^'"]+?)['"][;\s\r\n]*|(?:const|let|var)([\s\S]+?)=\s*require\s*\(\s*['"]([^'"]*?)['"]\s*\)[;\s\r\n]*/g;
const exportReg = /export\s+default\s+/g;
const utilsReg = /utils\.([\w\d_$]+)/g;

const warnings = [];
const map = new Map();

function findUtilsFun(code){
    let arr, name;
    arr = code.match(utilsReg);
    if(arr){
        arr.forEach(val=>{
            name = val.slice(6);
            if(utils[name] && !map.has(name)){
                let tmpCode;
                if(typeof utils[name] === 'function'){
                    tmpCode = name + ': function'+utils[name].toString().slice(name.length);
                }else if(typeof utils[name] === 'object'){
                    tmpCode = name + ': '+JSON.stringify(utils[name]);
                }
                map.set(name, tmpCode);
                findUtilsFun(tmpCode);
            }else{
                warnings.push('utils.'+name+' is undefined.');
            }
        });
    }
}

function babel(code, input) {
        //转换声明的关键字
    return code.replace(/(const|let)\s+/g,'var ')
        //转换箭头函数
        .replace(/(\(?)\s*(\(\s*[^)]*?\s*\)|[\w\d_$]+?)\s*=>\s*{/g,function ($0,$mark,$1) {
            if($1){
                return ($mark || '')+'function'+(/[()]/.test($1) ? $1 : '('+$1+')')+'{';
            }else{
                return ($mark || '')+'function(){';
            }
        })
        //转换代默认值的参数
        .replace(/function\s*\(\s*([^)]+?)\s*\)\s*{/g, function ($0,$1) {
            if($1){
                let vars = [];

                $1 = $1.replace(/([\w\d_$]+?)\s*=\s*(.*?)(,|$)/g, function ($10, $11, $12,$13) {
                    vars.push($11+' = '+$11+' || '+($12 || '\'\''));
                    return $11+($13 || '');
                });

                return 'function('+$1+'){'+(vars.length ? ('\n        var '+vars.join(',\n            ')+';') : '');
            }
        });
}

function babelClass(filePath, code) {
    let mod = require(filePath),
        api = Object.getOwnPropertyNames(mod.prototype),
        staticApi = Object.getOwnPropertyNames(mod),
        classCode;

    classCode = 'function ' + mod.name + mod.prototype._constructor.toString().slice('_constructor'.length);

    staticApi.forEach(staticFn=>{
        if(!/^(prototype|length|name)$/g.test(staticFn)){
            classCode += '\n'+mod.name + '.' + staticFn + ' = function' + mod[staticFn].toString().slice(staticFn.length)+';\n   ';
        }
    });

    classCode += '\n'+mod.name+'.prototype = {';
    api.forEach(fnName=>{
        if(!/^_?constructor$/.test(fnName)){
            classCode += '\n    '+fnName+': function'+mod.prototype[fnName].toString().slice(fnName.length)+',';
        }
    });
    classCode = classCode.slice(0,-1)+'\n};\n';

    code = code.replace(/class\s+([\w\d_$])[\s\S]+}/g, classCode)
        .replace(/module\.exports/g,'window.'+mod.name);

    fs.writeFileSync(filePath, code);
}

function parseUtils(input, output) {
    let code = fs.readFileSync(input),
        outPath = path.dirname(output);

    code = code.toString();

    findUtilsFun(code);

    code = code.replace(importReg, function ($0,$1,$2,$3,$4) {
            let moduleName = '',modulePath = '';
            if($1 && $2){
                moduleName = $1;
                modulePath = $2;
            }else if($3 && $4){
                moduleName = $3;
                modulePath = $4;
            }
            if(moduleName && modulePath){
                modulePath = path.join(path.dirname(input), modulePath);
                if(/utils(\.js)?$/.test(modulePath)){
                    return 'var utils={\n    '+Array.from(map.values()).join(',\n    ')+'\n};\n';
                }else{
                    return 'var '+moduleName+' = require("'+modulePath+'")';
                }
            }
            return '';
        }).replace(exportReg, 'module.exports = ');

    if(!fs.existsSync(outPath)){
        fs.mkdirSync(outPath);
    }

    code = babel(code, input);

    fs.writeFileSync(output, code.replace(/constructor/g,'_constructor'));

    babelClass(output, code);
}

parseUtils(path.join(basePath,'Calendar','main.js'), path.join(__dirname, 'dist', 'tools.js'));





