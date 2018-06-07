import utils from '../utils/utils';
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
    picker(options){
        let o = {
            name: 'year',
            container: 'div',
            list: 'div',
            item: 'div',
            current: 'div',
            className: 'calendar-picker',
            listClass: 'calendar-picker-list',
            itemClass: 'calendar-picker-item',
            currentClass: 'calendar-picker-current',
            selectedClass: 'calendar-picker-selected',
            from: 1970,
            to: Rdate.year+10
        };
        utils.options(o, options);
        options = null;

        if(o.name === 'month'){
            o.from = 1;
            o.to = 13;
        }
        let box = document.createElement(o.container),
            list = document.createElement(o.list),
            cur = document.createElement(o.current);

        box.className = o.className;
        list.className = o.listClass;
        cur.className = o.currentClass;

        for(let i = o.from; i<o.to; i++){
            let item = document.createElement(o.item);
            item.className = o.itemClass;
            if(i === this.dateTable[o.name]){
                utils.addClass(item, o.selectedClass);
            }
            item.innerText = i;
            utils.addEvent(item, 'click', function(e){
                e.value = i;
                Calendar.fire('pick', this, e);
            });
            list.appendChild(item);
        }

        cur.innerText = this.dateTable[o.name];

        box.appendChild(cur);
        box.appendChild(list);

        return box;
    }
    controller(options){
        let o = {
            container: 'div',
            prevYear: 'span',
            nextYear: 'span',
            prevMonth: 'span',
            nextMonth: 'span',
            className: 'calendar-controller',
            prevYearClass: 'calendar-controller-prevyear',
            nextYearClass: 'calendar-controller-nextyear',
            prevMonthClass: 'calendar-controller-prevmonth',
            nextMonthClass: 'calendar-controller-nextmonth',
            prevYearHTML: '&#171;',
            nextYearHTML: '&#187;',
            prevMonthHTML: '&#8249;',
            nextMonthHTML: '&#8250;'
        };

        utils.options(o, options);
        options = null;

        let box = document.createElement(o.container),
            prevy = document.createElement(o.prevYear),
            nexty = document.createElement(o.nextYear),
            prevm = document.createElement(o.prevMonth),
            nextm = document.createElement(o.nextMonth);

        box.className = o.className;
        prevy.className = o.prevYearClass;
        nexty.className = o.nextYearClass;
        prevm.className = o.prevMonth;
        nextm.className = o.nextMonth;

        prevy.innerHTML = o.prevYearHTML;
        nexty.innerHTML = o.nextYearHTML;
        prevm.innerHTML = o.prevMonthHTML;
        nextm.innerHTML = o.nextMonthHTML;

        box.appendChild(prevy);
        box.appendChild(prevm);
        box.appendChild(nextm);
        box.appendChild(nexty);

        utils.addEvent(prevy, function (e) {
            Calendar.fire('prevyear', this, e);
        });
        utils.addEvent(nexty, function (e) {
            Calendar.fire('nextyear', this, e);
        });
        utils.addEvent(prevm, function (e) {
            Calendar.fire('prevmonth', this, e);
        });
        utils.addEvent(nextm, function (e) {
            Calendar.fire('nextmonth', this, e);
        });

        return box;
    }
    on(e, fn){
        if(Calendar[e]){
            let index;
            if((index = utils.indexOf(Calendar[e], fn)) !== -1){
                Calendar[e][index] = fn;
            }else{
                Calendar[e].push(fn);
            }
        }
    }
    off(e, fn){
        if(Calendar[e]){
            for(let i=0,len=Calendar[e].length; i<len; i++){
                if(fn === Calendar[e][i]) {
                    Calendar[e].splice(i, 1);
                    break;
                }
            }
        }
    }
    static fire(name, bind, e){
        if(Calendar[name])
            for(let n=0,len=Calendar[name]; n<len; n++)
                Calendar[name][n].call(bind, e);
    }
    static toString(){
        return '{ [ class Calendar] }';
    }
}
Calendar.pick = [];
Calendar.nextyear = [];
Calendar.prevyear = [];
Calendar.nextmonth = [];
Calendar.prevmonth = [];

export default Calendar;