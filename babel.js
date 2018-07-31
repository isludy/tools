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
     * 替换并暂存被替换部分，以防干扰一些其他的处理
     * @param regName
     * @param prefix
     * @param postfix
     */
    replaceStorage(regName, prefix, postfix){
        this.code = this.code.replace(this.reg[regName], $0=>{
            let key = prefix+(this.increase++)+postfix;
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
            arr = [],
            mc,
            str,
            index = 0,
            mark,
            count,
            code,
            start;

        _this.replaceStorage('comment', '/*____', '____*/');
        _this.replaceStorage('string', '`____', '____`');

        str = _this.code;

        while(mc = reg.exec(str)){
            count = 0;
            code = mc[0];
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
                        mark = '____CLASS'+(index++)+'____';
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

    /**
     * 处理 object{ item, fn(){}, ... } 为 array[ 'item: item', 'item: function(){}', ...]
     * 返回数组给下一步处理
     * @param code
     * @returns {Array}
     */
    static obj2Array(code){
        let regKeyValue = /(?<=(\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]|\/\*[\s\S]*?\*\/[\r\n\u2028\u2029]*|^)\s*)[\w$_][\w\d$_]*$/,
            regFunc = /(?<=(\/\/[^\r\n\u2028\u2029]*?[\r\n\u2028\u2029]|\/\*[\s\S]*?\*\/[\r\n\u2028\u2029]*|^)\s*)[\w$_][\w\d$_]*(?=\s*\([^()]*?\))/,
            split = [],
            count = 0,
            pre = 0,
            start,
            end,
            len,
            isLast;

        code = code.trim().slice(1,-1);
        len = code.length;

        for(let i=0; i<len; i++){
            if(!start && (code[i] === '{' || code[i] === '(' || code[i] === '[')){
                start = code[i];
                switch (start){
                    case '{': end = '}'; break;
                    case '[': end = ']'; break;
                    case '(': end = ')'; break;
                }
            }
            if(code[i] === start){
                count++;
            }
            if(code[i] === end){
                count--;
            }
            if(count === 0){
                start = '';
            }
            isLast = i === len-1;
            if(!start && (code[i] === ',' || isLast) ){
                let v = code.slice(pre, (isLast ? i+1 : i)).trim(),
                    match;
                if(match = regKeyValue.exec(v)){
                    v = v + ': ' + match[0];
                }else if(match = regFunc.exec(v)){
                    v = v.slice(0, match.index)+match[0] + ': function' + v.slice(match.index+match[0].length);
                }
                split.push(v);
                pre = i+1;
            }
        }
        return split;
    }

    /**
     * 转换object
     */
    babelObj(){
        let _this = this,
            reg = /(?<!\)\s*|=>\s*){[\s\S]+}/,
            str,
            mc,
            count = 0,
            code,
            objCode;

        str = _this.code;

        while(mc = reg.exec(str)){
            count = 0;
            code = mc[0];

            for(let i=0, len=code.length; i<len; i++){
                if(code[i] === '{'){
                    count++;
                }else if(code[i] === '}'){
                    count--;
                    if(count === 0){
                        objCode = code.slice(0, i+1);
                        let objArr = Babel.obj2Array(objCode);
                        _this.code = _this.code.replace(objCode, '{\n'+objArr.join(',\n')+'\n}');
                        str = code.slice(1);
                        break;
                    }
                }
            }
        }
    }
    babelArrowFn(){
        let reg = /(\([\s\S]+\)|[\w$_][\w\d$_]*)\s*=>(?=\s*{)/g;
        this.code = this.code.replace(reg, ($0, $1)=>{
            console.log($1);
            return $0;
        });
    }
    babelFunParams(){

    }
}

let c = fs.readFileSync('t.js', 'utf8');
let bab = new Babel(c);
bab.babelClasses();
bab.babelObj();
bab.babelArrowFn();
// console.log(bab.code);
