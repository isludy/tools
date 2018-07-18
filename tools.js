var utils={
    timemat: function(time, type){
        var type = type || 0;
        var h = !type ? 0 : Math.floor(time/3600),
            i = Math.floor((time - h*3600) / 60),
            s = Math.floor(time - h*3600 - i*60);

        h = h < 10 ? '0' + h : h;
        i = i < 10 ? '0' + i : i;
        s = s < 10 ? '0' + s : s;
        return (!type ? '' : (h + ':')) + i + ':' + s;
    },
    addEvent: function(el, evt, fn, capture){
        var capture = capture || false;
        if(window.addEventListener){
            el.addEventListener(evt, fn, capture);
        }else if(window.attachEvent){
            el.attachEvent('on'+evt, fn);
        }
    },
    addClass: function(el, cls){
        if(el.classList){
            el.classList.add(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/);
            if(utils.indexOf(list, cls) === -1){
                list.push(cls);
            }
            el.className = list.join(' ');
        }
    },
    indexOf: function(arr, item){
        if(arr.indexOf){
            return arr.indexOf(item);
        }else{
            for(var i=0, l=arr.length; i<l; i++)
                if(arr[i] === item) return i;
            return -1;
        }
    },
    removeClass: function(el, cls){
        if(el.classList){
            el.classList.remove(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/),
                index;
            if((index = utils.indexOf(list, cls)) !== -1){
                list.splice(index, 1);
            }
            el.className = list.join(' ');
        }
    },
    isFullscreen: function() {
        return document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || false;
    },
    exitFullscreen: function(){
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.webkitCancelFullScreen){
            document.webkitCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.msExitFullscreen){
            document.msExitFullscreen();
        }
    },
    fullscreen: function(el){
        if(el.requestFullscreen) {
            el.requestFullscreen();
        } else if(el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if(el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        }else if(el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    },
    time: function(timemat){
        var arr = timemat.split(/[:：]+/);
        if(arr.length === 3){
            return parseInt(arr[0])*3600 + parseInt(arr[1])*60 + parseFloat(arr[2]);
        }else{
            return parseInt(arr[0])*60 + parseFloat(arr[1]);
        }
    },
    calced: function(node, attr){
        if(node && node.nodeType === 1 && window.getComputedStyle){
            return window.getComputedStyle(node)[attr];
        }else{
            return 0;
        }
    },
    setTransformY: function(el, v, bool){
        if('transform' in document.documentElement.style){
            el.style.webkitTransform =
                el.style.mozTransform =
                    el.style.msTransform =
                        el.style.oTransform =
                            el.style.transform = 'translateY('+ (bool ? v+'px' : '-'+v+'00%') + ')';
        }else{
            el.style.top = bool ? v+'px' : '-'+v+'00%';
        }
    },
    dateTable: function(year, month, opt){
        var year = year || -1,
            month = month || -1;
        var utils = this,
            date = new Date(),
            last,
            beforeDays,
            afterDays,
            startTime,
            total,
            table,
            o = {
                format: 'Y/M/D',
                mode: 0,
                limitRow: true
            };

        if(typeof year === 'object'){
            opt = year;
        }else{
            if(year !== -1)
                date.setFullYear(year);
            if(month !== -1)
                date.setMonth(month-1);
        }
        if(typeof opt === 'object'){
            for(var k in opt){
                if(o.hasOwnProperty(k)){
                    o[k] = opt[k];
                }
            }
        }
        opt = null;

        last = utils.lastDate(date.getFullYear(), date.getMonth()+1);

        table = {
            year: date.getFullYear(),
            month: date.getMonth()+1,
            weeks: utils.weeks.slice(0),
            dates: [],
            prevDates: [],
            nextDates: []
        };

        date.setDate(1);
        beforeDays = date.getDay();
        date.setTime(date.getTime() - beforeDays * 86400000);
        startTime = date.getTime();
        afterDays = (beforeDays + last) % 7;
        afterDays = afterDays ? 7-afterDays : 0;
        total = beforeDays + last + afterDays;

        //mode: 0 或 默认，周日在首，周六在末
        //mode: 1，周一在首，周日在末
        if(o.mode === 1){
            //前月填充部分大于0时，整个列队前移1位后，起始时间戳加1天，前部减1天，尾部加1天，如果原本是6天，加1天之后为7天，刚好一行，删除它，total减7
            if(beforeDays){
                startTime += 86400000;
                beforeDays--;
                if(afterDays < 6)
                    afterDays++;
                else{
                    afterDays = 0;
                    total -= 7;
                }
            }else{
                //前月填充为0时，整个列队前移1位后，前面需要六个填补，起始时间戳往前6天，尾部如果大于等于6，则减去6天，
                //前后抵销total不变，否则尾部加一天，加上前部添的6天，total加7天，其实就相当添了一行。
                startTime -= 6*86400000;
                beforeDays += 6;
                if(afterDays >= 6)
                    afterDays -= 6;
                else{
                    afterDays++;
                    total += 7;
                }
            }
            table.weeks.splice(0, 1);
            table.weeks.push(utils.weeks[0]);
        }
        //limitRow: 默认true, 保持7x6格布局
        //limitRow: false, 不保持7x6格布局
        if(o.limitRow && total < 42){
            //如果天数只有四行，比如2月份有可能，则分别添加到前、后各一行
            if(42 - total >= 14){
                startTime -= 7 * 86400000;
                beforeDays += 7;
                afterDays += 7;
            }else{
                //比较前后部分填充的量，补一行在较少部分
                if(beforeDays < afterDays){
                    startTime -= 7 * 86400000;
                    beforeDays += 7;
                }else{
                    afterDays += 7;
                }
            }
            total = 42;
        }

        for(; total--;)
            table.dates.unshift(utils.datemat(o.format, startTime+total*86400000));

        table.prevDates = table.dates.splice(0, beforeDays);
        table.nextDates = table.dates.splice(-afterDays, afterDays);
        return table;
    },
    lastDate: function(year, month){
        var year = year || -1,
            month = month || -1;
        var date = new Date();

        switch (arguments.length) {
            case 1:
                if(year > 0 && year <= 12)
                    date.setMonth(year);
                break;
            case 2:
                if(year >= 0)
                    date.setFullYear(year);
                if(month > 0 && month <= 12)
                    date.setMonth(month);
                break;
            default:
                date.setMonth(date.getMonth()+1);
        }

        date.setDate(0);

        return date.getDate();
    },
    weeks: ["日","一","二","三","四","五","六"],
    datemat: function(format, time){
        var format = format || 'Y/M/D H:I:S.C',
            time = time || -1;
        var date = new Date();

        if(typeof format === 'number'){
            time = format;
            format = 'Y/M/D H:I:S.C';
        }

        if(time !== -1)
            date.setTime(time);

        var o = {
            Y: date.getFullYear(),
            m: date.getMonth()+1,
            d: date.getDate(),
            h: date.getHours(),
            i: date.getMinutes(),
            s: date.getSeconds(),
            c: date.getMilliseconds()
        };
        o.y = (o.Y+'').slice(2);
        o.M = (o.m+100+'').slice(1);
        o.D = (o.d+100+'').slice(1);
        o.H = (o.h+100+'').slice(1);
        o.I = (o.i+100+'').slice(1);
        o.S = (o.s+100+'').slice(1);
        o.C = (o.c+1000+'').slice(1);

        format = format.split('');
        for(var len=format.length; len--;){
            var k = format[len];
            if(o[k]) format[len] = o[k];
        }
        return format.join('');
    },
    options: function(target, source, bool){
        var bool = bool || true;
        for(var k in source) {
            if (source.hasOwnProperty(k)) {
                if ((bool && target.hasOwnProperty(k)) || !bool) {
                    target[k] = source[k];
                }
            }
        }
        source = null;
        return target;
    },
    contains: function(target, context){
        if(context.contains){
            return context.contains(target);
        }else{
            if(target === context){
                return true;
            }else{
                var children = context.getElementsByTagName('*'),
                    len = children.length,
                    i = 0;
                for(; i<len; i++){
                    if(target === children[i]) return true;
                }
            }
        }
        return false;
    },
    removeEvent: function(el, evt, fn){
        if(window.removeEventListener){
            el.removeEventListener(evt, fn);
        }else{
            el.detachEvent('on'+evt, fn);
        }
    },
    isTouch: function(){
        return 'ontouchstart' in document;
    },
    wheel: function(elem, callback, useCapture){
        var prefix = "", _addEventListener, support;
        // detect event model
        if ( window.addEventListener ) {
            _addEventListener = "addEventListener";
        } else {
            _addEventListener = "attachEvent";
            prefix = "on";
        }

        // detect available wheel event
        support = "onwheel" in document ? "wheel" :
            document.onmousewheel !== undefined ? "mousewheel" : // Webkit / IE
                "DOMMouseScroll"; // firefox

        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support === "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }


        function _addWheelListener( elem, eventName, callback, useCapture ) {
            elem[ _addEventListener ]( prefix + eventName, support === "wheel" ? callback : function(originalEvent){
                !originalEvent && ( originalEvent = window.event );

                // create a normalized event object
                var event = {
                    // keep a ref to the original event object
                    originalEvent: originalEvent,
                    target: originalEvent.target || originalEvent.srcElement,
                    type: "wheel",
                    deltaMode: originalEvent.type === "MozMousePixelScroll" ? 0 : 1,
                    deltaX: 0,
                    deltaZ: 0,
                    preventDefault: function() {
                        originalEvent.preventDefault ?
                            originalEvent.preventDefault() :
                            originalEvent.returnValue = false;
                    }
                };

                // calculate deltaY (and deltaX) according to the event
                if ( support === "mousewheel" ) {
                    event.deltaY = - 1/40 * originalEvent.wheelDelta;
                    // Webkit also support wheelDeltaX
                    originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
                } else {
                    event.deltaY = originalEvent.detail;
                }

                // it's time to fire the callback
                return callback( event );

            }, useCapture || false );
        }
    },
    elsByClass: function(cls, context){
        context = context || document;
       if(context.getElementsByClassName){
           return context.getElementsByClassName(cls);
       }else if(context.querySelector){
           return context.querySelectorAll('.'+cls);
       }else{
           var utils = this,
               els = context.getElementsByTagName('*'),
               len = els.length,
               i = 0,
               doms = [];

           for(; i<len; i++){
               if(utils.hasClass(els[i], cls)){
                   doms.push(els[i]);
               }
           }
           return doms;
       }
    },
    hasClass: function(el, cls){
        if(el.classList){
            return el.classList.contains(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/);
            return utils.indexOf(list, cls) !== -1;
        }
    },
    toggleClass: function(el, cls){
        if(el.classList){
            el.classList.toggle(cls);
        }else{
            var utils = this,
                list = el.className.split(/\s+/),
                index;

            if((index = utils.indexOf(list, cls)) !== -1){
                list.splice(index, 1);
            }else{
                list.push(cls);
            }
            el.className = list.join(' ');
        }
    }
};
var Tools={};
/**----------- Player start line -------*/
(function(){
var lrcModeReg = /player-lrc-mode-[0-9]+/g;

function Player(id){
        var box = document.querySelector(id);
        if(box){
            this.lrcData = null;
            this.lrcKeys = null;
            this.lrcLen = 0;
            this.showLrcLines = 7;

            this.__define__('xhr', {
                value: new XMLHttpRequest()
            });
            this.__define__('timer', {
                writable: true,
                value: 0
            });
            this.__dom__();
            this.__obs__();

            box.appendChild(this[0]);
            this.__events__();
            this.volume = .5;

            this.__define__('private', {
                value: 1
            });
        }

    }
Player.__check__ = function(code, name){
        if(code === 1) throw TypeError(name+'是私有方法，不可调用');
    };
Player.toString = function(){
        return '{ [ class Player ] }';
    };
Player.prototype = {
    __dom__: function(){
        Player.__check__(this.private, '__dom__');
        this[0] = document.createElement('div');
        this[0].className = 'player player-1';
        this[0].innerHTML = '\
        <video data-name="video" class="player-video"></video>\
        <div data-name="lrc" class="player-lrc"></div>\
        <div data-name="ctrls" class="player-controls">\
            <div class="player-slider" title="播放时间滑块">\
                <div data-name="buf" class="player-slider-buf"></div>\
                <div data-name="thumb" class="player-slider-thumb"></div>\
            </div>\
            <div class="player-toolbar">\
                <div class="player-toolbar-left">\
                    <div data-name="btn" class="player-btn" title="播放/暂时"></div>\
                    <div data-name="cur" class="player-current-time">--:--</div>\
                    <div data-name="dur" class="player-duration">/ --:--</div>\
                </div>\
                <div class="player-toolbar-right">\
                    <div data-name="vbtn" class="player-vol-btn" title="音量">\
                        <i class="player-vol-rect"></i>\
                        <i class="player-vol-tri"></i>\
                        <i class="player-vol-stat">\
                            <i class="player-vol-dot1"></i>\
                            <i class="player-vol-dot2"></i>\
                            <i class="player-vol-dot3"></i>\
                            <i class="player-vol-mute">&times;</i>\
                        </i>\
                        <div class="player-vol-slidebar">\
                            <div class="player-vol-slide-track">\
                                <div data-name="vslider" class="player-vol-slider"></div>\
                            </div>\
                        </div>\
                    </div>\
                    <div data-name="rate" class="player-rate" title="播放速率">1x</div>\
                    <div data-name="fscreen" class="player-fullscreen" title="全屏切换">\
                        <i class="player-fullscreen-tl"></i>\
                        <i class="player-fullscreen-tr"></i>\
                        <i class="player-fullscreen-bl"></i>\
                        <i class="player-fullscreen-br"></i>\
                    </div>\
                </div>\
            </div>\
        </div>';

        this.els = {
            loading: document.createElement('div')
        };

        this.els.loading.className = 'r-loading';

        for(var els = this[0].querySelectorAll('[data-name]'),
                len=els.length,
                i=0;
            i<len; i++){
            this.els[els[i].getAttribute('data-name')] = els[i];
            els[i].removeAttribute('data-name');
        }
    },
    __define__: function(name, obj){
        Player.__check__(this.private, '__define__');
        Object.defineProperty(this, name, obj);
    },
    __ob__: function(attr, fn){
        Player.__check__(this.private, '__ob__');
        var oval;
        this.__define__(attr, {
            set(val){
                if(val !== oval){
                    oval = val;
                    fn(val);
                }
            },
            get(){return oval;}
        });
    },
    __obs__: function(){
        Player.__check__(this.private, '__obs__');
        var _this = this;

        _this.__ob__('src', function(val){
            _this.lrc = '';
            _this.lrcData = null;
            _this.lrcKeys = null;
            _this.lrcLen = 0;
            _this.poster = '';
            _this.els.video.src = val;
        });

        _this.__ob__('poster',function(val){
            if(!val){
                _this.els.video.removeAttribute('poster');
            }else{
                _this.els.video.poster = val;
            }
        });

        _this.__ob__('currentTime', function(val){
            _this.els.cur.innerText = utils.timemat(val);
            _this.els.thumb.style.width = (val / _this.duration) * 100 + '%';
            _this.getLrcActive(val);
        });

        _this.__ob__('volume', function(val){
            _this.els.video.volume = val;
            _this.els.vslider.style.height = val * 100 + '%';
        });

        _this.__ob__('activeIndex', function(){
            _this.renderLrc();
        });
    },
    __events__: function(){
        Player.__check__(this.private, '__events__');
        var _this = this,
            video = _this.els.video,
            btn = _this.els.btn,
            loading = _this.els.loading;

        utils.addEvent(window, 'resize', function () {
            _this.setLrcMode();
        });

        utils.addEvent(video, 'loadstart', function () {
            _this[0].appendChild(loading);
        });

        utils.addEvent(video, 'durationchange', function(){
            _this.duration = this.duration;
            _this.currentTime = 0;
            _this.els.dur.innerText = '/ ' + utils.timemat(this.duration);
            _this.els.video.playbackRate = parseFloat(_this.els.rate.innerText);
            _this.loadLrc();
        });

        utils.addEvent(video, 'loadeddata', function () {
            _this[0].removeChild(loading);
        });

        utils.addEvent(video, 'error', function () {
            loading.innerHTML = '加载失败';
            utils.addClass(loading, 'r-loadend');
            utils.removeClass(loading, 'r-loading');
        });

        utils.addEvent(btn, 'click', function(){
            if(video.paused){
                video.play();
                video.autoplay = true;
                utils.addClass(btn, 'player-btn-playing');
            }else{
                video.pause();
                video.autoplay = false;
                utils.removeClass(btn, 'player-btn-playing');
            }
        });

        utils.addEvent(video, 'timeupdate', function () {
            try{
                _this.els.buf.style.width = (video.buffered.end(video.buffered.length-1) / this.duration) * 100 + '%';
            }catch (err){}
            _this.currentTime = this.currentTime;
        });

        utils.addEvent(_this.els.thumb.parentNode, 'click', function(e){
            if(video.duration > 0){
                var percent = e.offsetX / this.offsetWidth;
                _this.currentTime = percent * video.duration;
                video.currentTime = Math.round(percent * video.duration);
            }
        });

        utils.addEvent(_this.els.vslider.parentNode, 'click',function(e){
            var info = this.getBoundingClientRect();
            _this.volume = (info.bottom - e.clientY)/info.height;
        });

        utils.addEvent(_this.els.vbtn, 'click', function(e){
            if(!_this.els.vslider.parentNode.parentNode.contains(e.target)){
                if(video.muted = !video.muted){
                    utils.addClass(_this[0], 'player-muted');
                }else{
                    utils.removeClass(_this[0], 'player-muted');
                }
            }
        },true);

        utils.addEvent(_this.els.rate, 'click', function(){
            var rate = parseFloat(this.innerText);
            rate += .25;
            if(rate > 2) rate = .25;
            _this.els.video.playbackRate = rate;
            this.innerText = rate+'x';
        });

        utils.addEvent(_this.els.fscreen, 'click', function(){
            if(utils.isFullscreen()){
                utils.exitFullscreen();
                utils.removeClass(_this.els.fscreen, 'player-fullscreen-on');
            }else{
                utils.fullscreen(_this[0]);
                utils.addClass(_this.els.fscreen, 'player-fullscreen-on');
            }
        });

        utils.addEvent(_this[0], 'mousemove', function(e){
            if(_this.timer) clearTimeout(_this.timer);

            if(!_this.els.ctrls.contains(e.target)){
                _this.showMouse();
                _this.timer = setTimeout(function(){_this.hideMouse()}, 2000);
            }
        });

        utils.addEvent(_this[0], 'mouseleave', function(){_this.hideMouse()});
    },
    showMouse: function(){
        clearTimeout(this.timer);
        this[0].style.cursor = 'default';
        utils.addClass(this.els.ctrls, 'player-controls-show');
    },
    hideMouse: function(){
        clearTimeout(this.timer);
        this[0].style.cursor = 'none';
        utils.removeClass(this.els.ctrls, 'player-controls-show');
    },
    loadLrc: function(){
        var _this = this;
        _this.els.lrc.innerHTML = '';
        if(!this.lrc) return;
        this.xhr.open('get', this.lrc, true);
        _this.xhr.onreadystatechange = function(){
            if(_this.xhr.readyState === 4){
                var txt = '[00:00.00]找不到歌词/字幕';
                if(_this.xhr.status === 200) {
                    txt = _this.xhr.responseText;
                }
                _this.readLrc(txt);
                _this.showLrc();
                _this.setLrcMode();
            }
        };
        _this.xhr.send();
    },
    readLrc: function(lrcText){
        var _this = this,
            lines;

        if(!lrcText) return;

        lines = lrcText.split(/\n+/);
        _this.lrcData = {};

        lines.forEach(function(line){
            line.replace(/\[([0-9:.\[\]]+)\]/ig, function(txt,$1){
                txt = line.slice(line.lastIndexOf(']')+1).replace(/\s+/g,'');
                if(txt){
                    for(var keys = $1.split(/\]\s*\[/), len = keys.length, i = 0; i<len; i++){
                        var key = utils.time(keys[i]);
                        if(_this.lrcData[key]){
                            _this.lrcData[key] += '<br>'+txt;
                        }else{
                            _this.lrcData[key] = txt;
                        }
                    }
                }
            });
        });
        lrcText = null;
        lines = null;
        _this.lrcKeys = Object.keys(_this.lrcData);
        _this.lrcKeys.sort(function(a, b){
            return Number(a) - Number(b);
        });
        _this.lrcLen = _this.lrcKeys.length;
        _this.activeIndex = 0;
    },
    getLrcActive: function(curtime){
        for(var i=0; i<this.lrcLen; i++){
            var delta = parseFloat(this.lrcKeys[i]) - curtime;
            if(delta >= 0){
                if(this.lrcKeys[i-1])
                    this.activeIndex = i-1;
                break;
            }
        }
    },
    showLrc: function(){
        utils.addClass(this.els.lrc, 'player-lrc-show');
    },
    hideLrc: function(){
        utils.removeClass(this.els.lrc, 'player-lrc-show');
    },
    renderLrc: function(){
        if(this.lrcMode === 1){
            this.els.lrc.innerHTML = '';
            var lines = this.showLrcLines,
                half = Math.floor(lines/2),
                delta = Math.round(100/(half+1));

            for(var j=0, idx=0, opc=delta; j<lines; j++){
                idx = this.activeIndex+j-half;
                if(idx <= this.activeIndex){
                    opc += delta;
                }else{
                    opc -= delta;
                }
                if(this.lrcKeys[idx]){
                    this.els.lrc.innerHTML += '<div class="player-lrc-line'+(idx === this.activeIndex ? ' player-lrc-line-active' : '')+'" style="opacity: '+(opc-delta)/100+';">'+this.lrcData[this.lrcKeys[idx]]+'</div>';
                }
            }
        }else{
            this.els.lrc.innerHTML = '<div class="player-lrc-line player-lrc-line-active">'+this.lrcData[this.lrcKeys[this.activeIndex]]+'</div>';
        }
    },
    setLrcMode: function(lrcMode){
        if(typeof lrcMode === 'number'){
            this.lrcMode = lrcMode;
        }
        if(this.lrcKeys) this.renderLrc();

        if(lrcModeReg.test(this.els.lrc.className)){
            this.els.lrc.className = this.els.lrc.className.replace(lrcModeReg, 'player-lrc-mode-'+(this.lrcMode || 0));
        }else{
            this.els.lrc.className += ' player-lrc-mode-'+(this.lrcMode || 0);
        }

        var lrcLine = this.els.lrc.children[0],
            lh = 32,
            lrcTop;
        if(lrcLine){
            lh = lrcLine.offsetHeight + (Number(utils.calced(lrcLine,'lineHeight')) || 0);
        }
        if(this.lrcMode === 1){
            lrcTop = (this[0].offsetHeight - lh*this.showLrcLines)/2;
        }else{
            lrcTop = this[0].offsetHeight - lh*2;
        }
        utils.setTransformY(this.els.lrc, lrcTop, true);
    },
    setLrcLines: function(num){
        if(typeof num === 'number'){
            this.showLrcLines = num;
            if(this.lrcMode === 1) this.setLrcMode();
        }
    }
};


Tools.Player=Player;
})();

/**----------- Player end line -------*/

/**----------- Calendar start line -------*/
(function(){
var todayDate = new Date();
var Rdate = {
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

function Calendar(year, month, options){
        var args = arguments,
            len = args.length;

        this.mode = 0;
        this.format = 'Y/M/D';
        this.limitRow = true;

        for(; len--; ){
            if(typeof args[len] === 'object'){
                for(var k in args[len]){
                    if(this.hasOwnProperty(k)){
                        this[k] = args[len][k];
                    }
                }
                break;
            }
        }

        this.dateTable = utils.dateTable(year, month, options);
    }
Calendar.abc = function(){
        return 'abc';
    };
Calendar.toString = function(){
        return '{ [ class Calendar] }';
    };
Calendar.prototype = {
    weeker: function(options){
        var o = {
            container: 'div',
            className: 'calendar-weeker',
            item: 'span',
            itemClass: 'calendar-weeker-item',
            activeClass: 'calendar-weeker-active',
            activeMode: 0
        };
        utils.options(o, options);
        options = null;

        var activeIndex,
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

        this.dateTable.weeks.forEach(function(item, index){
            html += '<'+o.item+' class="'+o.itemClass+(strictActive && index === activeIndex ? ' '+o.activeClass : '')+'">'+item+'</'+o.item+'>';
        });

        box = document.createElement(o.container);
        box.className = o.className;
        box.innerHTML = html;
        return box;
    },
    dater: function(options){
        var o = {
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

        var dates = this.dateTable,
            isCur = dates.year === Rdate.year && dates.month === Rdate.month,
            active = '',
            html = '',
            box;

        dates.prevDates.forEach(function(item){
            html += '<'+o.item+' class="'+o.itemClass+' '+o.itemPrevClass+'">'+item+'</'+o.item+'>';
        });
        dates.dates.forEach(function(item, index){
            index++;
            if( (o.activeMode === 0 && index === Rdate.date) || (isCur && index === Rdate.date)){
                active = ' '+o.activeClass;
            }else{
                active = '';
            }
            html += '<'+o.item+' class="'+o.itemClass+active+'">'+item+'</'+o.item+'>';
        });
        dates.nextDates.forEach(function(item){
            html += '<'+o.item+' class="'+o.itemClass+' '+o.itemNextClass+'">'+item+'</'+o.item+'>';
        });

        box = document.createElement(o.container);
        box.className = o.className;
        box.innerHTML = html;

        return box;
    }
};

var abc = {};

Tools.Calendar=Calendar;
})();

/**----------- Calendar end line -------*/

/**----------- ScaleControl start line -------*/
(function(){
function ScaleControl(){
        var box = document.createElement('div'),
            points = {
                topLeft: box.cloneNode(),
                topCenter: box.cloneNode(),
                topRight: box.cloneNode(),
                midLeft: box.cloneNode(),
                midCenter: box.cloneNode(),
                midRight: box.cloneNode(),
                bottomLeft: box.cloneNode(),
                bottomCenter: box.cloneNode(),
                bottomRight: box.cloneNode()
            },
            test = /[A-Z]/g;

        box.className = 'scale-control';

        for(var k in points){
            points[k].className = 'scale-control-point scale-control-' + k.replace(test, function($0){
                return '-'+$0.toLowerCase();
            });
            box.appendChild(points[k]);
        }
        this.matrix = [0,0,0,0,0,0];
        this.points = points;
        this[0] = box;
        this.el = null;
        ScaleControl.bindEvent(this);
    }
ScaleControl.fixToEl = function(el, box){
        box.style.top = el.offsetTop + 'px';
        box.style.left = el.offsetLeft + 'px';
        box.style.width = el.offsetWidth + 'px';
        box.style.height = el.offsetHeight + 'px';
    };
ScaleControl.bindEvent = function(_this){
        var w, h, pX, pY, startX, startY, endX, endY, isX, isY, isMove, isLeft, isTop,
            box = _this[0],
            points = _this.points;

        function moveHandler(e){
            if(isMove){
                _this.matrix[0] = pX + e.clientX - startX;
                _this.matrix[1] = pY + e.clientY - startY;
                box.style.left = _this.matrix[0] + 'px';
                box.style.top = _this.matrix[1] + 'px';
            }else{
                if(isX){
                    if(isLeft){
                        _this.matrix[0] = pX + e.clientX - startX;
                        _this.matrix[2] = w - e.clientX + startX;
                        box.style.left = _this.matrix[0] + 'px';
                        box.style.width = _this.matrix[2] + 'px';
                    }else{
                        _this.matrix[2] = w + e.clientX - startX;
                        box.style.width = _this.matrix[2] + 'px';
                    }
                }
                if(isY){
                    if(isTop){
                        _this.matrix[1] = pY + e.clientY - startY;
                        _this.matrix[3] = h - e.clientY + startY;
                        box.style.top = _this.matrix[1] + 'px';
                        box.style.height = _this.matrix[3] + 'px';
                    }else{
                        _this.matrix[3] = h + e.clientY - startY;
                        box.style.height = _this.matrix[3] + 'px';
                    }
                }
                if(e.shiftKey){
                    _this.matrix[3] = box.offsetWidth * (_this.matrix[5] / _this.matrix[4]);
                    box.style.height = _this.matrix[3] + 'px';
                }
            }

            _this.el.style.left = _this.matrix[0] + 'px';
            _this.el.style.top = _this.matrix[1] + 'px';
            _this.el.style.width = _this.matrix[2] + 'px';
            _this.el.style.height = _this.matrix[3] + 'px';

            ScaleControl.fixToEl(_this.el, box);
        }

        function upHandler(){
            utils.removeClass(_this.el, 'scale-control-unselect');
            utils.removeEvent(document, 'mousemove', moveHandler);
            utils.removeEvent(document, 'mouseup', upHandler);
        }

        utils.addEvent(_this[0], 'mousedown', function(e){
            var target = e.target;
            utils.addClass(_this.el, 'scale-control-unselect');

            w = box.offsetWidth;
            h = box.offsetHeight;
            pX = box.offsetLeft;
            pY = box.offsetTop;
            startX = e.clientX;
            startY = e.clientY;
            endX = startX;
            endY = startY;
            isX = false;
            isY = false;
            isMove = false;
            isLeft = false;
            isTop = false;

            if(target === points.topCenter || target === points.bottomCenter){
                isX = false;
                isY = true;
            }else if(target === points.midLeft || target === points.midRight){
                isX = true;
                isY = false;
            }else{
                isX = true;
                isY = true;
            }

            isMove = target === points.midCenter;
            isLeft = target === points.topLeft || target === points.midLeft || target === points.bottomLeft;
            isTop = target === points.topLeft || target === points.topCenter || target === points.topRight;

            utils.addEvent(document, 'mousemove', moveHandler);
            utils.addEvent(document, 'mouseup', upHandler);
        });
    };
ScaleControl.prototype = {
    bind: function(el){
        if(el && el.nodeType === 1){
            this.matrix[0] = el.offsetLeft;
            this.matrix[1] = el.offsetTop;
            this.matrix[2] = el.offsetWidth;
            this.matrix[3] = el.offsetHeight;
            if(this.el !== el){
                this.matrix[4] = el.offsetWidth;
                this.matrix[5] = el.offsetHeight;
            }
            this.el = el;
            el.parentNode.appendChild(this[0]);
            ScaleControl.fixToEl(el, this[0]);
        }
    },
    unbind: function(){
        this.matrix[0] = this.matrix[1] = this.matrix[2] = this.matrix[3] = this.matrix[4] = this.matrix[5] = 0;
        if(this[0].parentNode)
            this[0].parentNode.removeChild(this[0]);
    },
    contains: function(target){
        return utils.contains(target, this[0]);
    }
};

Tools.ScaleControl=ScaleControl;
})();

/**----------- ScaleControl end line -------*/

/**----------- Scrollbar start line -------*/
(function(){
function Scrollbar(id){
        var isTouch = utils.isTouch();
        this.body = document.getElementById(id);
        if(!this.body)
            throw new Error('Element is not found by id "'+id+'"');

        this.content = this.body.querySelector('.scroll-content');
        this.scrollbar = {
            y: this.body.querySelector('.scroll-y'),
            x: this.body.querySelector('.scroll-x')
        };
        this.thumb = {
            y: null,
            x: null
        };

        this.events = ['mousedown', 'mousemove', 'mouseup'];
        if(isTouch){
            this.events = ['touchstart', 'touchmove', 'touchend'];
            if(this.scrollbar.y)
                Scrollbar.touchSscroll(this, 'scrollTop','clientY', 'maxY');
            if(this.scrollbar.x)
                Scrollbar.touchSscroll(this, 'scrollLeft','clientX', 'maxX');
        }

        if(this.scrollbar.y){
            this.thumb.y = this.scrollbar.y.querySelector('.scroll-thumb');
            Scrollbar.createScroll(this, 'y', 'offsetHeight', 'offsetTop', 'height','top', 'scrollHeight', 'scrollTop', 'clientY', 'offsetY', 'maxY', 'spaceY');
            utils.wheel(this.content, function(e){
                e.preventDefault();
                this.scrollTop += e.deltaY;
            },{passive: false});
        }
        if(this.scrollbar.x){
            this.thumb.x = this.scrollbar.x.querySelector('.scroll-thumb');
            Scrollbar.createScroll(this, 'x', 'offsetWidth', 'offsetLeft', 'width','left', 'scrollWidth', 'scrollLeft', 'clientX', 'offsetX', 'maxX', 'spaceX');
        }
    }
Scrollbar.createScroll = function(_, y, offsetHeight, offsetTop, height, top, scrollHeight, scrollTop, clientY, offsetY, maxY, spaceY){
        var oh, sh, th, isTouch = utils.isTouch(), start = 0, end = 0, cur = 0, prev = 0, result = 0, dir = 0, prevent = {passive: false};

        oh = _.content[offsetHeight];
        sh = _.content[scrollHeight];

        _.thumb[y].style[height] =  (oh/sh)*oh+ 'px';

        th = _.thumb[y][offsetHeight];

        Object.defineProperty(_, maxY, {value: sh - oh});
        Object.defineProperty(_, spaceY, {value: oh - th});
        Object.defineProperty(_, scrollHeight, {value: sh});
        Object.defineProperty(_, scrollTop, {
            set(val){
                if(val !== _.content[scrollTop]){
                    _.content[scrollTop] = val;
                }
            },
            get(){
                return _.content[scrollTop];
            }
        });

        _.content.addEventListener('scroll', function () {
            _.thumb[y].style[top] = ((this[scrollTop]/_[maxY])*_[spaceY]) + 'px';
            _[scrollTop] = this[scrollTop];
        });
        _.scrollbar[y].addEventListener(_.events[0], function(e){
            if(e.button > 0 || utils.contains(e.target, _.thumb[y])) return false;
            e = isTouch ? e.targetTouches[0] : e;
            _.content[scrollTop] = e[offsetY]/this[offsetHeight] * _[maxY];
        });

        _.thumb[y].addEventListener(_.events[0], startFn, prevent);

        function startFn(e) {
            e.preventDefault();
            e = isTouch ? e.targetTouches[0] : e;
            start = e[clientY];
            end = prev = start;
            cur = _.thumb[y][offsetTop];
            result = 0;

            utils.addClass(document.body, 'scroll-unselect');

            document.addEventListener(_.events[1], moveFn, prevent);
            document.addEventListener(_.events[2], endFn);
        }
        function moveFn(e){
            e.preventDefault();
            e = isTouch ? e.targetTouches[0] : e;
            end = e[clientY];
            dir = end - prev < 0 ? -1 : 1;

            result = end - start + cur;

            if(_.content[scrollTop] <= 2 && dir < 0){
                start = end;
                cur = _.thumb[y][scrollTop];
                result = 0;
            }else if(_.content[scrollTop] >= _[maxY]-2 &&  dir > 0){
                start = end;
                cur = _.thumb[y][offsetTop];
                result = _[spaceY];
            }
            _.thumb[y].style[top] = result + 'px';
            _[scrollTop] = (result / _[spaceY])*_[maxY];
            prev = end;
        }
        function endFn(){
            document.removeEventListener(_.events[1], moveFn, prevent);
            document.removeEventListener(_.events[2], endFn);
            utils.removeClass(document.body, 'scroll-unselect');
        }

    };
Scrollbar.touchSscroll = function(_, scrollTop, clientY, maxY){
        var touchY = 0, end = 0, startTop = 0, prev = 0, speed = 0, prevent = {passive: false}, timer;
        _.content.addEventListener('touchstart', function(e){
            e.preventDefault();

            touchY = e.targetTouches[0][clientY];
            startTop = _.content[scrollTop];
            prev = touchY;
            document.addEventListener('touchmove', moveFn, prevent);
            document.addEventListener('touchend', endFn);
        }, prevent);

        function moveFn(e) {
            e.preventDefault();
            end = e.targetTouches[0][clientY];
            speed = end - prev;
            prev = end;
            _.content[scrollTop] = startTop + (touchY - end);
        }

        function endFn() {
            var d = Math.abs(speed), dis = end-touchY, dir = dis < 0 ? 1 : -1;
            document.removeEventListener('touchmove', moveFn, prevent);
            document.removeEventListener('touchend', endFn);

            //缓冲
            if(Math.abs(dis) > 5){
                if(timer) clearInterval(timer);
                timer = setInterval(function () {
                    d *= .8;
                    if(d < 1) clearInterval(timer);
                    _.content[scrollTop] += d*dir;
                }, 16.6);
            }
        }
    };
Scrollbar.prototype = {
    hide: function(which){
        if(this.scrollbar[which].parentNode === this.body)
            this.body.removeChild(this.scrollbar[which]);
    },
    show: function(which){
        if(this.scrollbar[which].parentNode !== this.body)
            this.body.appendChild(this.scrollbar[which]);
    }
};

Tools.Scrollbar=Scrollbar;
})();

/**----------- Scrollbar end line -------*/

/**----------- Rnav start line -------*/
(function(){
function Rnav(nav, options) {
        var _ = this,
            o = {
                item: 'nav-item',
                more: 'nav-more',
                show: 'nav-show',
                active: 'nav-active'
            };

        utils.options(o, options);
        options = null;

        if(nav.nodeType !== 1){
            nav = document.getElementById(nav);
            if(!nav) throw 'Error: nav is null';
        }

        _.nav = nav;
        _.items = utils.elsByClass(o.item);
        _.more = utils.elsByClass(o.more)[0];
        _.length = _.items.length;

        _.update();

        utils.addEvent(_.more, 'click', function(e){
            utils.toggleClass(nav, o.show);
            if(typeof _.onClickMore === 'function') _.onClickMore.call(this, e);
        });

        for(var i = 0; i<_.length; i++){
            utils.addEvent(_.items[i], 'click', function(){
                for(var i = 0; i<_.length; i++) {
                    utils.removeClass(_.items[i], o.active);
                }
                utils.addClass(this, o.active);
            });
        }
    }
Rnav.prototype = {
    onClickMore: function(){},
    update: function(){
        var _ = this,
            count = 0,
            itemsWidth = 0,
            i = 0,
            bool = false;

        for (; i < _.length; i++) {
            itemsWidth += _.items[i].offsetWidth;
            if (this.items[i].offsetTop > 0) {
                _.nav.insertBefore(_.more, this.items[i]);
                utils.addClass(_.more, 'nav-more-show');
                bool = true;
                break;
            }
        }
        if(!bool){
            utils.removeClass(_.more, 'nav-more-show');
        }
        (function recycle(){
            if (_.more.offsetTop > 0) {
                _.nav.insertBefore(_.more, _.more.previousSibling);
                if (_.more.offsetTop > 0 && count < _.length) {
                    recycle();
                    count++;
                }
            }
        })();
    }
};

Tools.Rnav= Rnav;
})();

/**----------- Rnav end line -------*/

