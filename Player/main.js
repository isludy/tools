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
            this.init(document.querySelector(id));
        }

    }
    init(box){
        this.currentTime = 0;
        this.duration = 0;
        this.volume = .5;
        this.createDom();
        this.defineProps();
        box.appendChild(this[0]);
    }
    createDom(){
        this[0] = document.createElement('div');
        this[0].className = 'player';
        this[0].innerHTML = `
        <video data-name="video" class="player-video"></video>
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

        this.els = {};

        for(let els = this[0].querySelectorAll('[data-name]'),
                len=els.length,
                i=0;
            i<len; i++){
            this.els[els[i].getAttribute('data-name')] = els[i];
            els[i].removeAttribute('data-name');
        }
    }
    defineProps(){
        let _this = this,
            curtime = this.currentTime,
            volume = this.volume;
        Object.defineProperty(this, 'currentTime', {
            set(val){
                if(val !== curtime){
                    curtime = val;
                    _this.els.cur.innerText = utils.timemat(curtime);
                    _this.els.thumb.style.width = (curtime / _this.duration) * 100 + '%';
                }
            },
            get(){
                return curtime;
            }
        });
        Object.defineProperty(this, 'volume', {
            set(val){
                if(val !== volume){
                    volume = val;
                    _this.els.video.volume = volume;
                    _this.els.vthumb.style.width = volume * 100 + '%';
                }
            },
            get(){
                return volume
            }
        });
    }
    bindEvent(){
        let _this = this,
            video = _this.els.video,
            btn = _this.els.btn,
            timer;
        utils.addEvent(video, 'durationchange', function(){
            _this.duration = this.duration;
            _this.els.dur.innerText = '/ ' + utils.timemat(this.duration);
            _this.showLrc(0);
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
            _this.showLrc(this.currentTime);
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
        //TODO================
        // utils.addEvent(_this[0], 'mousemove', function(e){
        //     if(timer) clearTimeout(timer);
        //     if(e.target === video || lrcData){
        //         player.style.cursor = 'default';
        //         utils.addClass(controls, 'player-controls-show');
        //         timer = setTimeout(hideMouse, 2000);
        //     }
        // });
        // utils.addEvent(player, 'mouseleave', function () {
        //     hideMouse();
        // });
    }
    showLrc(curtime){

    }
}
export default Player;