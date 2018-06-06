import Rdate from '../Rdate/main';

class Calendar{
    constructor(year, month, options){
        let args = arguments,
            len = args.length,
            o = {
                mode: 0,
                format: 'Y/M/D'
            };
        for(; len--; ){
            if(typeof args[len] === 'object'){
                for(let k in args[len]){
                    o[k] = args[len][k];
                }
                break;
            }
        }
        this.mode = o.mode;
        this.format = o.format;

        o = null;

        this.dateTable = Rdate.dateTable(year, month, options);
    }
    getWeeker(options){
        let o = {
            container: 'div',
            className: 'calendar-weeker',
            item: 'span',
            itemClass: 'calendar-weeker-item',
            activeClass: 'calendar-weeker-active',
            activeMode: 0,
            returnType: 0
        };
        for(let k in options)
            o[k] = options[k];
        options = null;

        let activeIndex,
            strictActive = false,
            html = '',
            box;

        activeIndex = Rdate.day;

        if(this.mode === 1){
            activeIndex--;
            if(activeIndex < 0)
                activeIndex = 6;
        }

        if(o.activeMode === 1){
            if(Rdate.year === this.dateTable.year && Rdate.month === this.dateTable.month)
                strictActive = true;
        }else{
            strictActive = true;
        }

        this.dateTable.weeks.forEach((item, index)=>{
            html += '<'+o.item+' class="'+o.itemClass+(strictActive && index === activeIndex ? ' '+o.activeClass : '')+'">'+item+'</'+o.item+'>';
        });

        if(o.returnType === 1){
            box = document.createElement(o.container);
            box.className = o.className;
            box.innerHTML = html;
        }else{
            box = '<'+o.container+' class="'+o.className+'">'+html+'</'+o.container+'>';
        }
        return box;
    }
    getDater(options){
        let o = {
            container: 'div',
            className: 'calendar-dater',
            item: 'span',
            itemClass: 'calendar-dater-item',
            itemPrevClass: 'calendar-dater-prev',
            itemNextClass: 'calendar-dater-next',
            activeClass: 'calendar-dater-active',
            activeMode: 1,
            returnType: 0
        };
        for(let k in options)
            o[k] = options[k];
        options = null;

        let dates = this.dateTable,
            isCur = dates.year === Rdate.year && dates.month === Rdate.month,
            active = '',
            html = '',
            box;

        dates.prevDates.forEach(item=>{
            html += '<'+o.item+' class="'+o.itemClass+' '+o.itemPrevClass+'">'+item+'</'+o.item+'>';
        });
        dates.dates.forEach((item, index)=>{
            index++;
            if( (o.activeMode === 0 && index === Rdate.date) || (isCur && index === Rdate.date)){
                active = ' '+o.activeClass;
            }else{
                active = '';
            }
            html += '<'+o.item+' class="'+o.itemClass+active+'">'+item+'</'+o.item+'>';
        });
        dates.nextDates.forEach(item=>{
            html += '<'+o.item+' class="'+o.itemClass+' '+o.itemNextClass+'">'+item+'</'+o.item+'>';
        });

        if(o.returnType === 1){
            box = document.createElement(o.container);
            box.className = o.className;
            box.innerHTML = html;
        }else{
            box = '<'+o.container+' class="'+o.className+'">'+html+'</'+o.container+'>';
        }

        return box;
    }
    getSelector(options){
        let o = {
            name: 'year',
            container: 'div',
            item: 'div',
            list: 'div',
            current: 'div',
            currentClass: 'calendar-selector-current',
            className: 'calendar-selector',
            itemClass: 'calendar-selector-item',
            listClass: 'calendar-selector-list',
            selectedClass: 'calendar-selector-selected',
            returnType: 0,
            from: 1970,
            to: Rdate.year+10
        };
        for(let k in options)
            o[k] = options[k];
        options = null;

        if(o.name === 'month'){
            o.from = 1;
            o.to = 13;
        }
        let html = '',
            box;
        for(let i = o.from; i<o.to; i++){
            html += '<'+o.item+' class="'+o.itemClass+'"'+(i===this.dateTable[o.name] ? ' ' + o.selectedClass : '')+'>'+i+'</'+o.item+'>';
        }
        html = '<'+o.current+' class="'+o.currentClass+'">'+this.dateTable[o.name]+'</'+o.current+'><'+o.list+' class="'+o.listClass+'">'+html+'</'+o.list+'>';
        if(o.returnType === 1){
            box = document.createElement(o.container);
            box.className = o.className;
            box.innerHTML = html;
        }else{
            box = '<'+o.container+' class="'+o.className+'">'+html+'</'+o.container+'>';
        }
        return box;
    }
    static toString(){
        return '{ [ class Calendar] }';
    }
}

export default Calendar;