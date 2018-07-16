import utils from '../../utils/utils';

const todayDate = new Date();
const Rdate = {
    todayDate,
    year: todayDate.getFullYear(),
    month: todayDate.getMonth()+1,
    date: todayDate.getDate(),
    day: todayDate.getDay(),
    time: todayDate.getTime(),
    hour: todayDate.getHours(),
    minute: todayDate.getMinutes(),
    second: todayDate.getSeconds(),
    ms: todayDate.getMilliseconds()
};

class Calendar{
    constructor(year, month, options){
        let args = arguments,
            len = args.length;

        this.mode = 0;
        this.format = 'Y/M/D';
        this.limitRow = true;

        for(; len--; ){
            if(typeof args[len] === 'object'){
                for(let k in args[len]){
                    if(this.hasOwnProperty(k)){
                        this[k] = args[len][k];
                    }
                }
                break;
            }
        }

        this.dateTable = utils.dateTable(year, month, options);
    }
    weeker(options){
        let o = {
            container: 'div',
            className: 'calendar-weeker',
            item: 'span',
            itemClass: 'calendar-weeker-item',
            activeClass: 'calendar-weeker-active',
            activeMode: 0
        };
        utils.options(o, options);
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

        box = document.createElement(o.container);
        box.className = o.className;
        box.innerHTML = html;
        return box;
    }
    dater(options){
        let o = {
            container: 'div',
            className: 'calendar-dater',
            item: 'span',
            itemClass: 'calendar-dater-item',
            itemPrevClass: 'calendar-dater-prev',
            itemNextClass: 'calendar-dater-next',
            activeClass: 'calendar-dater-active',
            activeMode: 1
        };
        utils.options(o, options);
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

        box = document.createElement(o.container);
        box.className = o.className;
        box.innerHTML = html;

        return box;
    }
    static abc(){
        return 'abc';
    }
    static toString(){
        return '{ [ class Calendar] }';
    }
}

export default Calendar;