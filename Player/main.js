import utils from '../utils/utils';

export default (arg1, arg2)=>{
    let player = document.createElement('div'),
        video = document.createElement('video'),
        controls = document.createElement('div'),
        lrcBox = document.createElement('div'),
        xhr = new XMLHttpRequest(),
        lrcKeys = [],
        lrcLen = 0,
        lrcData;

    player.className = 'player';
    video.className = 'player-video';
    controls.className = 'player-controls';
    lrcBox.className = 'player-lrc';

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
        showLrc(0);
    });
    utils.addEvent(video, 'timeupdate', function () {
        try{
            els.buf.style.width = (video.buffered.end(video.buffered.length-1) / this.duration) * 100 + '%';
        }catch (err){}

        showLrc(this.currentTime);

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
    utils.addEvent(els.vswitch, 'click', function () {
        if(video.muted = !video.muted){
            utils.addClass(player, 'player-muted');
        }else{
            utils.removeClass(player, 'player-muted');
        }
    });
    utils.addEvent(player, 'mousemove', function(e){
        if(timer) clearTimeout(timer);
        if(e.target === video || lrcData){
            player.style.cursor = 'default';
            utils.addClass(controls, 'player-controls-show');
            timer = setTimeout(hideMouse, 2000);
        }
    });
    utils.addEvent(player, 'mouseleave', function () {
        hideMouse();
    });

    function hideMouse(){
        clearTimeout(timer);
        player.style.cursor = 'none';
        utils.removeClass(controls, 'player-controls-show');
    }

    function setOptions(o){
        utils.removeClass(lrcBox, 'player-lrc-show');
        video.lrc = '';
        lrcBox.innerHTML = '';
        lrcData = null;
        lrcKeys = [];
        lrcLen = 0;
        if(typeof o === 'object'){
            for(let key in o){
                video[key] = o[key];
            }
        }else if(typeof o === 'string' && arguments[1]){
            video[o] = arguments[1];
        }
        if(video.lrc){
            loadLyc(video.lrc);
        }
        if(o.container && o.container.nodeType === 1){
            o.container.innerHTML = '';
            o.container.appendChild(player);
        }
    }

    function loadLyc(lrcUrl){
        xhr.open('get', lrcUrl, true);
        xhr.onreadystatechange = function () {
            if(xhr.readyState === 4 && xhr.status === 200){
                lrcData = utils.readLyric(xhr.responseText);
                let frag = document.createDocumentFragment(),
                    lrcLine = document.createElement('p');
                lrcLine.className = 'player-lrc-line';
                for(let k in lrcData){
                    lrcLine = lrcLine.cloneNode(true);
                    lrcLine.innerText = lrcData[k];
                    lrcData[k] = lrcLine;
                    frag.appendChild(lrcLine);
                }
                lrcBox.appendChild(frag);
                utils.addClass(lrcBox, 'player-lrc-show');
                lrcKeys = Object.keys(lrcData);
                lrcLen = lrcKeys.length;
            }
        };
        xhr.send();
    }

    function showLrc(curtime){
        for(let i=0, delta; i<lrcLen; i++){
            delta = (1 - Math.abs(utils.time(lrcKeys[i]) - curtime)/10);
            if(delta > .96){
                lrcBox.style.top = player.offsetHeight/2-lrcData[lrcKeys[i]].offsetTop + 'px';
            }
            if(delta >= -10){
                lrcData[lrcKeys[i]].style.opacity = delta;
            }
        }
    }

    player.appendChild(video);
    player.appendChild(lrcBox);
    player.appendChild(controls);

    setOptions(arg1, arg2);

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
