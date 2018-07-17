/**----------- Player start line -------*/
(function(){
import utils from '../utils/utils';

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


export default Player;
})();
/**----------- Player start line -------*/

/**----------- Calendar start line -------*/
(function(){
import utils from '../../utils/utils';

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

export default Calendar;
})();
/**----------- Calendar start line -------*/

/**----------- ScaleControl start line -------*/
(function(){
import utils from '../utils/utils';

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

export default ScaleControl;
})();
/**----------- ScaleControl start line -------*/

/**----------- Scrollbar start line -------*/
(function(){
import utils from '../utils/utils';

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

export default Scrollbar;
})();
/**----------- Scrollbar start line -------*/

/**----------- Rnav start line -------*/
(function(){
import utils from '../../utils/utils';

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

module.exports = Rnav;
})();
/**----------- Rnav start line -------*/

