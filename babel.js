const fs = require('fs');

const reg = {
    comment: /\/\*[\s\S]*?\*\/|\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]/g,
    string: /`[^`]*?`|'.*[\\']*.*?'|".*[\\"]*.*?"/g,
    classObj: /(?<![\w\d$_])class\s+([\w$_][\w\d$_]*)(\s+[\w$_][\w\d$_]*)*\s*(?={)/g,
};

class Babel{
    constructor(code){
        this.code = code;
        this.reg = reg;
        this.increase = 0;
        this.storege = new Map();
    }
    /**
     * 必免干扰，暂存注释
     */
    markComment(){
        this.code = this.code.replace(this.reg.comment, $0=>{
            let key = '/*____'+(this.increase++)+'____*/';
            this.storege.set(key,$0);
            return key;
        });
    }
    /**
     * 必免干扰，暂标记、替换字符串的位置
     */
    markString(){
        this.code = this.code.replace(this.reg.string, $0=>{
            let key = '`____'+(this.increase++)+'____`';
            this.storege.set(key,$0);
            return key;
        });
    }
    /**
     * 转换所有class（类）对象
     */
    babelClasses(){
        let _this = this,
            reg = /(?<![\w\d$_])class\s+([\w$_][\w\d$_]*)(?:\s+extends\s+([\w$_][\w\d$_]*))*\s*{[\s\S]+}/,
            arr = [], mc, str, index = 0;

        _this.markComment();
        _this.markString();

        str = _this.code;

        while(mc = reg.exec(str)){
            let count = 0,
                code = mc[0],
                start = 0;

            for(let i=0, len=code.length; i<len; i++){
                if(code[i] === '{'){
                    count++;
                }
                if(count === 0){
                    start++;
                }
                if(code[i] === '}'){
                    count--;
                    if(count === 0){
                        let mark = '___CLASS'+(index++)+'____';
                        arr.push({
                            mark,
                            extend: mc[2],
                            name: mc[1],
                            code: code.slice(start, i+1)
                        });
                        _this.code = _this.code.replace(code.slice(0, i+1), mark);
                        str = code.slice(i+1);
                        break;
                    }
                }
            }
        }
        let exclude = /^(name|length|prototype)$/,
            newClassStr, classObj, staticApi, api;
        arr.forEach(item=>{
            newClassStr = 'class '+item.name+item.code.replace(/(?<![\w\d$_])constructor(\s*\([^)]*?\))/, '_constructor$1')
                .replace(/(?<![\w\d$_])(super\([^)]*?\))/,'/*____$1*/');

            classObj = eval('('+newClassStr+')');
            staticApi = Object.getOwnPropertyNames(classObj);
            api = Object.getOwnPropertyNames(classObj.prototype);

            str = 'function '+item.name+classObj.prototype['_constructor'].toString().slice(12);

            staticApi.forEach(staticFn=>{
                if(!exclude.test(staticFn)) {
                    str += item.name + '.' + staticFn + ' = function' + classObj[staticFn].toString().slice(staticFn.length)+';';
                }
            });

            let tmpArr = [];
            api.forEach(fn=>{
                if(fn !== '_constructor' && fn !== 'constructor'){
                    tmpArr.push(fn+': function'+classObj.prototype[fn].toString().slice(fn.length));
                }
            });
            str += item.name + '.prototype = {' + tmpArr.join(',') + '};';

            if(item.extend) {
                str = str.replace(/\/\*____super\(([^)]*?)\)\*\//, ($0, $1) => {
                    return item.extend + '.call(this' + ($1.trim() ? ',' + $1 : '') + ')';
                });
                str += 'var ' + item.name + 'PROTO = Object.create(' + item.extend + '.prototype);\n' +
                    'for(var proto in ' + item.name + 'PROTO){\n' +
                    item.name + '.prototype[proto] = ' + item.name + 'PROTO[proto];\n' +
                    '}\n' +
                    item.name + 'PROTO = null;';
            }
            _this.code = _this.code.replace(item.mark, str);
        });
    }
}

let c = fs.readFileSync('t.js', 'utf8');
let bab = new Babel(c);
 bab.babelClasses();
console.log(bab.code);
