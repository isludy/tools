const fs = require('fs');

/**
 * 执行转换的主函数
 * @param code
 * @return {string}
 */
function babel(code) {
        //处理class
    return code.replace(/class\s+([\w$_]+[\w\d$_]*?)\s*({[\s\S]+})/g, function ($0, $1, $2) {
            let totalLen = $2.length, classLen;
            $2 = matchPair($2, '{', '}')[0];
            classLen = $2.length;
            return babelClass('class '+$1+$2) + (totalLen === classLen ? '' : $0.substr(classLen - totalLen));
        })
        //转换模板字符
        .replace(/`([^`]*?)`/g,function ($0, $1) {
            return '\''+$1.replace(/[\r\n]/g,'\\\n').replace(/\${([^}])}/g,'\'+$1+\'')+'\'';
        })
        //处理const和let
        .replace(/(const|let)\s+/g,'var ')
        //处理省略function定义的函数
        .replace(/(?<!function)\s+([\w$_]+[\w\d$_]*)(\s*\([^()]*?\)\s*)(?={)/g, ($0, $1, $2)=>{
            if(!/for|if|while|switch|function/.test($1.trim())){
                return $1+': function'+$2;
            }
            return $0;
        })
        //处理箭头函数
        .replace(/(?:\(([^()]*?)\)|([\w$_]+[\w\d$_]*))\s*=>\s*(?={)/g, ($0, $1, $2)=>{
            $1 = $1 || $2;
            return 'function('+($1 || '')+')';
        })
        //处理写在形参里的默认值
        .replace(/(?<=function)\s*\(\s*([^()]*?=[^()]*?)\s*\)\s*{/g, ($0,$1)=>{
            let defs = '';
            $1 = $1.replace(/\s+/g,'').replace(/([\w$_]+[\w\d$_]*?)=([\s\S]*?)(,|$)/g, ($10, $11, $12)=>{
                defs += '\n        '+$11 + ' = ' + $11 + ' || ' + $12+';';
                return $11+',';
            }).replace(/,$/g,'');
            console.log($1);
            return '('+$1+'){'+defs;
        });
}
let a = babel(fs.readFileSync('./src/Calendar/Calendar.js','utf8'));
// let a = babel(fs.readFileSync('./utils/utils.js','utf8'));
fs.writeFileSync('t.js', a);

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
                wait = true;
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

/**
 * 把获取class构建的es5代码（如果class有自定义静态方法toString，必须把constructor构造器替换为普通方法_contructor）
 * @param code
 * @return {string}
 */
function babelClass(code) {
    let classObj = eval('('+code.replace(/constructor(\s*\([^)]*?\)\s*)(?={)/g, '_constructor$1')+')'),
        api = Object.getOwnPropertyNames(classObj.prototype),
        staticApi = Object.getOwnPropertyNames(classObj),
        classCode;

    classCode = 'function ' + classObj.name + classObj.prototype._constructor.toString().slice('_constructor'.length);

    staticApi.forEach(staticFn=>{
        if(!/^(prototype|length|name)$/g.test(staticFn)){
            classCode += '\n'+classObj.name + '.' + staticFn + ' = function' + classObj[staticFn].toString().slice(staticFn.length)+';';
        }
    });

    classCode += '\n'+classObj.name+'.prototype = {';
    api.forEach(fnName=>{
        if(!/^_?constructor$/.test(fnName)){
            classCode += '\n    '+fnName+': function'+classObj.prototype[fnName].toString().slice(fnName.length)+',';
        }
    });
    return  classCode.slice(0,-1)+'\n};\n';
}

exports = babel;