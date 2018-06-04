import utils from '../utils/utils';

class Player{
    constructor(id, opt=''){
        if(typeof id === 'object'){
            opt = id;
            id = opt.selector;
        }
        if(typeof id === 'string'){
            if(typeof opt === 'object'){
                this.options = opt;
            }
            this.__define__('xhr', {
                value: new XMLHttpRequest()
            });
            this.__define__('lrcData',{
                writable: true,
                value: null
            });
            this.__define__('lrcKeys', {
                writable: true,
                value: null
            });
            this.__define__('lrcLen', {
                writable: true,
                value: 0
            });
            this.__define__('lrcLineActive', {
                writable: true,
                value: 0
            });
            this.__define__('timer', {
                writable: true,
                value: 0
            });
            this.__define__('lrcTopBase', {
                writable: true,
                value: 0
            });

            this.__init__(document.querySelector(id));

            this.__define__('private', {
                value: 0
            });
        }

    }
    __init__(box){
        this.__check__('init');
        this.__dom__();
        this.__ob__();

        this.currentTime = 0;
        this.volume = .5;
        this.duration = 0;

        this.__bindEvent__();
        box.appendChild(this[0]);
    }
    __dom__(){
        this.__check__('__createDom__');
        this[0] = document.createElement('div');
        this[0].className = 'player player-1';
        this[0].innerHTML = `
        <video data-name="video"${this.options.src ? ' src="'+this.options.src+'"':''} poster="${this.options.poster||''}" class="player-video"></video>
        <div data-name="lrc" class="player-lrc"></div>
        <div data-name="ctrls" class="player-controls">
            <div class="player-slider">
                <div data-name="buf" class="player-slider-buf"></div>
                <div data-name="thumb" class="player-slider-thumb"></div>
            </div>
            <div class="player-toolbar">
                <div class="player-toolbar-left">
                    <span data-name="btn" class="player-btn"></span>
                    <span data-name="cur" class="player-current-time">--:--</span>
                    <span data-name="dur" class="player-duration">/ --:--</span>
                </div>
                <div class="player-toolbar-right">
                    <span data-name="vswitch" class="player-volume-switch">
                        <i class="player-volume-switch-rect"></i>
                        <i class="player-volume-switch-tri"></i>
                        <i class="player-volume-switch-stat">
                            <i class="player-volume-switch-dot1"></i>
                            <i class="player-volume-switch-dot2"></i>
                            <i class="player-volume-switch-dot3"></i>
                            <i class="player-volume-switch-mute">&times;</i>
                        </i>
                    </span>
                    <span class="player-volume-slider">
                        <i data-name="vthumb" class="player-volume-slider-thumb"></i>
                    </span>
                    <span data-name="fscreen" class="player-fullscreen">
                        <i class="player-fullscreen-tl"></i>
                        <i class="player-fullscreen-tr"></i>
                        <i class="player-fullscreen-bl"></i>
                        <i class="player-fullscreen-br"></i>
                    </span>
                </div>
            </div>
        </div>`;

        this.els = {
            loading: document.createElement('div')
        };

        this.els.loading.className = 'r-loading';

        for(let els = this[0].querySelectorAll('[data-name]'),
                len=els.length,
                i=0;
            i<len; i++){
            this.els[els[i].getAttribute('data-name')] = els[i];
            els[i].removeAttribute('data-name');
        }
    }
    __define__(name, obj){
        this.__check__('__define__');
        Object.defineProperty(this, name, obj);
    }
    __ob__(){
        this.__check__('__ob__');
        let _this = this,
            curtime,
            volume;
        _this.__define__('currentTime', {
            set(val){
                if(val !== curtime){
                    curtime = val;
                    _this.els.cur.innerText = utils.timemat(curtime);
                    _this.els.thumb.style.width = (curtime / _this.duration) * 100 + '%';
                    _this.lrcUpdating(curtime);
                }
            },
            get(){return curtime;}
        });
        _this.__define__('volume', {
            set(val){
                if(val !== volume){
                    volume = val;
                    _this.els.video.volume = volume;
                    _this.els.vthumb.style.width = volume * 100 + '%';
                }
            },
            get(){return volume}
        });
    }

    __bindEvent__(){
        this.__check__('bindEvent');
        let _this = this,
            video = _this.els.video,
            btn = _this.els.btn,
            loading = _this.els.loading;

        utils.addEvent(window, 'resize', function () {
            _this.updateLrcTopBase();
        });

        utils.addEvent(video, 'loadstart', function () {
            _this[0].appendChild(loading);
        });

        utils.addEvent(video, 'durationchange', function(){
            _this.duration = this.duration;
            _this.currentTime = 0;
            _this.els.dur.innerText = '/ ' + utils.timemat(this.duration);
            _this.loadLrc(_this.options.lrc);
        });

        utils.addEvent(video, 'loadeddata', function () {
            _this[0].removeChild(loading);
        });

        utils.addEvent(video, 'error', function () {
            loading.innerHTML = 'fail';
            utils.addClass(loading, 'r-loadend');
            utils.removeClass(loading, 'r-loading');
        });

        utils.addEvent(btn, 'click', function(){
            if(video.paused){
                video.play();
                utils.addClass(btn, 'player-btn-playing');
            }else{
                video.pause();
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
                _this.lrcKeys.forEach(key => {
                    _this.lrcData[key].removeAttribute('style');
                });
                let percent = e.offsetX / this.offsetWidth;
                _this.currentTime = percent * video.duration;
                video.currentTime = Math.round(percent * video.duration);
            }
        });

        utils.addEvent(_this.els.vthumb.parentNode, 'click',function(e){
            _this.volume = e.offsetX / this.offsetWidth;
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

        utils.addEvent(_this.els.vswitch, 'click', function () {
            if(video.muted = !video.muted){
                utils.addClass(_this[0], 'player-muted');
            }else{
                utils.removeClass(_this[0], 'player-muted');
            }
        });

        utils.addEvent(_this[0], 'mousemove', function(e){
            if(_this.timer) clearTimeout(_this.timer);

            if(!_this.els.ctrls.contains(e.target)){
                _this.showMouse();
                _this.timer = setTimeout(()=>{_this.hideMouse()}, 2000);
            }
        });

        utils.addEvent(_this[0], 'mouseleave', ()=>{_this.hideMouse()});
    }
    showMouse(){
        clearTimeout(this.timer);
        this[0].style.cursor = 'default';
        utils.addClass(this.els.ctrls, 'player-controls-show');
    }
    hideMouse(){
        clearTimeout(this.timer);
        this[0].style.cursor = 'none';
        utils.removeClass(this.els.ctrls, 'player-controls-show');
    }
    loadLrc(src){
        let _this = this;
        _this.els.lrc.innerHTML = '';
        if(!src) return;
        this.xhr.open('get', src, true);
        _this.xhr.onreadystatechange = function(){
            if(_this.xhr.readyState === 4){
                if(_this.xhr.status === 200) {
                    _this.els.lrc.appendChild(_this.readLrc(_this.xhr.responseText));
                }else{
                    _this.els.lrc.appendChild(_this.readLrc('[00:00.00]找不到歌词/字幕'));
                }
                _this.showLrc();
                _this.updateLrcTopBase();
                _this.lrcUpdating(0);
            }
        };
        _this.xhr.send();
    }
    readLrc(lrcText){
        let _this = this,
            frag = document.createDocumentFragment(),
            lines;

        if(!lrcText) return frag;

        lines = lrcText.split(/\n+/);
        _this.lrcData = {};

        lines.forEach(line=>{
            line.replace(/\[([0-9:.\[\]]+)\]/ig, function(txt,$1){
                txt = line.slice(line.lastIndexOf(']')+1).replace(/\s+/g,'');
                if(txt){
                    for(let keys = $1.split(/\]\s*\[/), len = keys.length, i = 0; i<len; i++){
                        let key = utils.time(keys[i]);
                        if(_this.lrcData[key]){
                            _this.lrcData[key].innerHTML += '<br>'+txt;
                        }else{
                            let line = document.createElement('div');
                            line.className = 'player-lrc-line';
                            line.innerHTML = txt;
                            _this.lrcData[key] = line;
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
        _this.lrcKeys.forEach(key=>{
            frag.appendChild(_this.lrcData[key]);
        });
        _this.lrcLen = _this.lrcKeys.length;
        _this.lrcLineActive = _this.lrcData[_this.lrcKeys[0]];
        return frag;
    }
    updateLrcTopBase(){
        let line = this.els.lrc.children[0],
            lh = 32,
            lrcTop;

        if(line)
            lh = line.offsetHeight*2;
        switch (this.options.lrcMode){
            case 1:
                lrcTop = this[0].offsetHeight - lh;
                break;
            default:
                lrcTop = this[0].offsetHeight/2 - lh/2;
        }
        this.lrcTopBase = lrcTop;
        this.setLrcTop();
    }
    setLrcTop(){
        if(this.lrcLineActive)
            this.els.lrc.style.top = this.lrcTopBase - this.lrcLineActive.offsetTop + 'px';
    }
    lrcUpdating(curtime){
        for(let i=0; i<this.lrcLen; i++){
            let delta = (1 - Math.abs(this.lrcKeys[i] - curtime)/10);
            if(delta > .96){
                if(this.lrcLineActive){
                    this.lrcLineActive.style.opacity = 0;
                    utils.removeClass(this.lrcLineActive, 'player-lrc-line-active');
                }
                this.lrcLineActive =  this.lrcData[this.lrcKeys[i]];
                this.switchLrcStyle(i);
                this.setLrcTop();
                utils.addClass(this.lrcLineActive, 'player-lrc-line-active');
            }
        }
    }
    showLrc(){
        utils.addClass(this.els.lrc, 'player-lrc-show');
    }
    hideLrc(){
        utils.removeClass(this.els.lrc, 'player-lrc-show');
    }
    switchLrcStyle(activeIndex){
        if(this.options.lrcMode === 1){
            this.lrcLineActive.style.opacity = 1;
        }else{
            for(let j=0, idx=0, opc=0; j<9; j++){
                idx = activeIndex+j-4;
                if(idx <= activeIndex){
                    opc += 25;
                }else{
                    opc -= 25;
                }
                if(this.lrcKeys[idx]){
                    this.lrcData[this.lrcKeys[idx]].style.opacity = (opc-25)/100;
                }
            }
        }
    }
    switchLrcMode(lrcMode){
        if(typeof lrcMode !== 'number') return;
        let _this = this;

        _this.options.lrcMode = lrcMode;
        if(_this.lrcKeys)
            _this.lrcKeys.forEach(key => {
                if(_this.lrcData[key] !== _this.lrcLineActive)
                    _this.lrcData[key].removeAttribute('style');
            });
        _this.updateLrcTopBase();
        for(let i=0; i<_this.lrcLen; i++){
            if(_this.lrcData[_this.lrcKeys[i]] === _this.lrcLineActive){
                _this.switchLrcStyle(i);
                break;
            }
        }
    }
    update(){
        let o = this.options;
        this.currentTime = 0;
        this.duration = this.lrcLen = 0;
        this.lrcKeys = this.lrcData = null;
        this.hideLrc();
        if(o.src)
            this.els.video.src = o.src;
        this.els.video.poster = o.poster || '';
    }
    __check__(name){
        if(this.private === 0) throw TypeError((name||'__check__')+'是私有方法，不可调用');
    }
    static toString(){
        return '{ [ class Player ] }';
    }
}
export default Player;