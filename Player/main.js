import utils from '../utils/utils';

function Player(){
    let player = document.createElement('div'),
        video = document.createElement('video'),
        controls = document.createElement('div');

    player.className = 'player';
    video.className = 'player-video';
    controls.className = 'player-controls';

    controls.innerHTML = `
            <div class="player-slider">
                <div data-name="buf" class="player-slider-buf"></div>
                <div data-name="thumb" class="player-slider-thumb"></div>
            </div>
            <div class="player-toolbar">
                <div class="player-toolbar-left">
                    <span data-name="btn" class="player-btn"></span>
                    <span data-name="cur" class="player-current-time">00:00</span>
                    <span data-name="dur" class="player-duration">/ 00:00</span>
                </div>
                <div class="player-toolbar-right">
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
            </div>`;

    let names = controls.querySelectorAll('[data-name]'),
        len = names.length,
        i = 0,
        els = {},
        timer;

    for(; i<len; i++){
        els[names[i].getAttribute('data-name')] = names[i];
        names[i].removeAttribute('data-name');
    }

    els.vthumb.style.width = '50%';
    video.volume = .5;

    utils.addEvent(video, 'durationchange', function(){
        els.dur.innerText = '/ ' + utils.timemat(this.duration);
    });
    utils.addEvent(video, 'timeupdate', function () {
        try{
            els.buf.style.width = (video.buffered.end(video.buffered.length-1) / this.duration) * 100 + '%';
        }catch (err){}
        els.cur.innerText = utils.timemat(this.currentTime);
        els.thumb.style.width = (this.currentTime / this.duration) * 100 + '%';
    });
    utils.addEvent(els.thumb.parentNode, 'click', function(e){
        if(video.duration > 0){
            let percent = e.offsetX / this.offsetWidth;
            els.thumb.style.width = percent * 100 + '%';
            video.currentTime = Math.round(percent * video.duration);
            els.cur.innerText = utils.timemat(video.currentTime);
        }
    });
    utils.addEvent(els.btn, 'click', function(){
        if(video.paused){
            video.play();
            utils.addClass(els.btn, 'player-btn-playing');
        }else{
            video.pause();
            utils.removeClass(els.btn, 'player-btn-playing');
        }
    });
    utils.addEvent(els.vthumb.parentNode, 'click',function(e){
        video.volume = e.offsetX / this.offsetWidth;
        els.vthumb.style.width = Math.round(video.volume * 100) + '%';
    });
    utils.addEvent(els.fscreen, 'click', function(){
        if(utils.isFullscreen()){
            utils.exitFullscreen();
            utils.removeClass(els.fscreen, 'player-fullscreen-on');
        }else{
            utils.fullscreen(player);
            utils.addClass(els.fscreen, 'player-fullscreen-on');
        }
    });
    utils.addEvent(video, 'mousemove', function(){
        if(timer) clearTimeout(timer);
        player.style.cursor = 'default';
        utils.addClass(controls, 'player-controls-show');
        timer = setTimeout(hideMouse, 2000);
    });

    function hideMouse(){
        clearTimeout(timer);
        player.style.cursor = 'none';
        utils.removeClass(controls, 'player-controls-show');
    }

    player.appendChild(video);
    player.appendChild(controls);

    function setOptions(o){
        if(typeof o === 'object'){
            for(let key in o){
                video[key] = o[key];
            }
        }else if(typeof o === 'string' && arguments[1]){
            video[o] = arguments[1];
        }
    }
    setOptions(arguments[0], arguments[1]);

    return {
        el: player,
        set: setOptions,
        get(attr){
            if(attr)
                return video.getAttribute(attr);
            return video;
        }
    };
}
if(window){
    window.Player = Player;
}else{
    module.exports = Player;
}