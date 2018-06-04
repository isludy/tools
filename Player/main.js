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
            this.__define__('timer', {
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
            volume,
            activeIndex;
        _this.__define__('currentTime', {
            set(val){
                if(val !== curtime){
                    curtime = val;
                    _this.els.cur.innerText = utils.timemat(curtime);
                    _this.els.thumb.style.width = (curtime / _this.duration) * 100 + '%';
                    _this.getLrcActive(curtime);
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
            get(){return volume;}
        });
        _this.__define__('activeIndex', {
            set(val){
                if(val !== activeIndex){
                    activeIndex = val;
                    _this.renderLrc();
                }
            },
            get(){return activeIndex;}
        });
    }

    __bindEvent__(){
        this.__check__('bindEvent');
        let _this = this,
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
                let txt = '[00:00.00]找不到歌词/字幕';
                if(_this.xhr.status === 200) {
                    txt = _this.xhr.responseText;
                }
                _this.readLrc(txt);
                _this.showLrc();
                _this.setLrcMode();
            }
        };
        _this.xhr.send();
    }
    readLrc(lrcText){
        let _this = this,
            lines;

        if(!lrcText) return;

        lines = lrcText.split(/\n+/);
        _this.lrcData = {};

        lines.forEach(line=>{
            line.replace(/\[([0-9:.\[\]]+)\]/ig, function(txt,$1){
                txt = line.slice(line.lastIndexOf(']')+1).replace(/\s+/g,'');
                if(txt){
                    for(let keys = $1.split(/\]\s*\[/), len = keys.length, i = 0; i<len; i++){
                        let key = utils.time(keys[i]);
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
    }
    getLrcActive(curtime){
        for(let i=0; i<this.lrcLen; i++){
            let delta = parseFloat(this.lrcKeys[i]) - curtime;
            if(delta >= 0){
                if(this.lrcKeys[i-1])
                    this.activeIndex = i-1;
                break;
            }
        }
    }
    showLrc(){
        utils.addClass(this.els.lrc, 'player-lrc-show');
    }
    hideLrc(){
        utils.removeClass(this.els.lrc, 'player-lrc-show');
    }
    renderLrc(){
        if(this.options.lrcMode === 1){
            this.els.lrc.innerHTML = '<div class="player-lrc-line player-lrc-line-active">'+this.lrcData[this.lrcKeys[this.activeIndex]]+'</div>';
        }else{
            this.els.lrc.innerHTML = '';
            for(let j=0, idx=0, opc=0; j<9; j++){
                idx = this.activeIndex+j-4;
                if(idx <= this.activeIndex){
                    opc += 25;
                }else{
                    opc -= 25;
                }
                if(this.lrcKeys[idx]){
                    this.els.lrc.innerHTML += '<div class="player-lrc-line'+(idx === this.activeIndex ? ' player-lrc-line-active' : '')+'" style="opacity: '+(opc-25)/100+';">'+this.lrcData[this.lrcKeys[idx]]+'</div>';
                }
            }
        }
    }
    setLrcMode(lrcMode){
        if(typeof lrcMode === 'number'){
            this.options.lrcMode = lrcMode;
        }
        this.renderLrc();
        let lrcLine = this.els.lrc.children[0],
            lh = 32,
            lrcTop;
        if(lrcLine){
            lh = lrcLine.offsetHeight + (Number(utils.getCalced(lrcLine,'lineHeight')) || 0);
        }
        if(this.options.lrcMode === 1){
            lrcTop = this[0].offsetHeight - lh*2;
        }else{
            lrcTop = (this[0].offsetHeight - lh*9)/2;
        }

        utils.setTransformY(this.els.lrc, lrcTop, true);
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