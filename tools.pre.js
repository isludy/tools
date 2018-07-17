const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const utils = require('./utils/utils');
const config = require('./tools.config');

const importReg = /import([\s\S]+?)from[\s\n\r]+['"]([^'"]+?)['"][;\s\r\n]*|(?:const|let|var)([\s\S]+?)=\s*require\s*\(\s*['"]([^'"]*?)['"]\s*\)[;\s\r\n]*/g;
const exportReg = /export\s+default\s+|(module\.)*exports\s*=/g;
const utilsReg = /utils\.([\w\d_$]+)/g;

const warnings = [];
const map = new Map();

/**
 * 把用到的utils添加到map中
 * @param code
 */
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

/**
 * 简单的把ES6转为ES5
 * @param code
 * @return {string}
 */
function babel(code) {
        //转换声明的关键字
    return code.replace(/(const|let)\s+/g,'var ')
        //转换箭头函数
        .replace(/(\(\s*[^()]*?\s*\))\s*=>\s*{/g,'function$1{').replace(/([\w\d_$]+?)\s*=>\s*{/g,'function($1){')
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
        })
        //转换class构建类
        .replace(/class\s+([^{]+?)\s*({[\s\S]+})/g,function ($0, $1, $2) {
            let len1 = $2.length, len2, classMod;
            $2 = matchPair($2, '{', '}');
            $2 = $2[0];
            len2 = $2.length;

            $2 = $2.replace('constructor', '_constructor');
            classMod = eval('(class '+$1+$2+')');
            return babelClass(classMod) + (len1 === len2 ? '' : $0.substr(len1, len2));
        })
        //转换模板字符
        .replace(/`([^`]*?)`/g,function ($0, $1) {
            return '\''+$1.replace(/[\r\n]+/g,'\\\n').replace(/\${([^}])}/g,'\'+$1+\'')+'\'';
        });
}

/**
 * 把获取class构建的es5代码（如果class有自定义静态方法toString，必须把constructor构造器替换为普通方法_contructor）
 * @param mod 类对象
 * @return {string}
 */
function babelClass(mod) {
    let api = Object.getOwnPropertyNames(mod.prototype),
        staticApi = Object.getOwnPropertyNames(mod),
        classCode;

    classCode = 'function ' + mod.name + mod.prototype._constructor.toString().slice('_constructor'.length);

    staticApi.forEach(staticFn=>{
        if(!/^(prototype|length|name)$/g.test(staticFn)){
            classCode += '\n'+mod.name + '.' + staticFn + ' = function' + mod[staticFn].toString().slice(staticFn.length)+';';
        }
    });

    classCode += '\n'+mod.name+'.prototype = {';
    api.forEach(fnName=>{
        if(!/^_?constructor$/.test(fnName)){
            classCode += '\n    '+fnName+': function'+mod.prototype[fnName].toString().slice(fnName.length)+',';
        }
    });
    return  classCode.slice(0,-1)+'\n};\n';
}

/**
 * 查找多层嵌套的成对符号的最外层。
 * @param str   输入的字符串
 * @param start 符号左半边
 * @param end   符号右半边
 * @return {Array}
 */
function matchPair(str, start, end){
    let reg = new RegExp('['+start+']|['+end+']','g'),
        wait = true,
        starts = [],
        ends = [],
        n = 0,
        arr;
    while (arr = reg.exec(str)){
        if(wait && arr[0] === end) continue;
        if(arr[0] === start){
            wait = false;
            n++;
            if(n === 1){
                starts.push(arr.index);
            }
        }else{
            n--;
            if(n === 0){
                ends.push(arr.index);
            }
        }
    }

    arr = [];

    starts.forEach((v, i)=>{
        if(i < ends.length){
            arr.push(str.slice(v, ends[i]+end.length));
        }
    });

    return arr;
}

let pagePath = path.join(__dirname, 'index.html'),
    templateReg = /<!--\[-->([\s\S]*?)<!--]-->/g,
    templates = [];
function createDemo(demo){
    if(fs.existsSync(demo)){
        let demoCode = fs.readFileSync(demo).toString(),
            demoHtml = '',
            arr;

        while(arr = templateReg.exec(demoCode)){
            demoHtml += arr[1];
        }

        templates.push(demoHtml.replace(/new (\w+\([^)]*?\))/, 'new Tools.$1'));

    }
}
/**
 * 合成js
 */
function mergeJs(){
    if(Array.isArray(config.tools)){
        let mount = config.mount || 'Tools',
            output = path.resolve(config.output) || path.join(__dirname, 'dist', 'tools.js'),
            outputCss = path.resolve(config.outputCss) || path.join(__dirname, 'dist', 'tools.css'),
            outPath = path.dirname(output),
            pageCode = fs.readFileSync(pagePath).toString(),
            input,
            code,
            inputCss,
            cssCode,
            commentStart,
            commentEnd;

        if(!fs.existsSync(outPath)){
            childProcess.execSync('md '+outPath);
        }

        fs.writeFileSync(output,'var Tools={};\n');
        fs.writeFileSync(outputCss, '');

        config.tools.forEach(tool=>{
            input = path.join(__dirname, 'src', tool, tool+'.js');
            inputCss = path.join(__dirname, 'src', tool, tool+'.css');
            commentStart = '/**----------- '+tool+' start line -------*/\n';
            commentEnd = '\n/**----------- '+tool+' end line -------*/\n\n';
            if(fs.existsSync(input)){
                code = fs.readFileSync(input).toString();
                findUtilsFun(code);
                fs.appendFileSync(output,
                    commentStart+
                    '(function(){\n'+ babel(code).replace(importReg,'').replace(exportReg, mount + '.' + tool + '=')+'\n})();\n'+
                    commentEnd);
            }
            if(fs.existsSync(inputCss)){
                cssCode = fs.readFileSync(inputCss).toString();
                fs.appendFileSync(outputCss, commentStart+cssCode+commentEnd);
            }

            createDemo(path.join(__dirname, 'src', tool, 'demo.html'));
        });

        code = babel('var utils={\n    '+Array.from(map.values()).join(',\n    ')+'\n};\n') + fs.readFileSync(output).toString();

        fs.writeFileSync(output, code);

        pageCode = pageCode.replace(/(<body[^>]*?>)[\s\S]*?(<\/body>)/g, '$1\n'+templates.join('\n')+'$2');
        fs.writeFileSync(pagePath, pageCode);
    }
}

mergeJs();





