/**
 * 需要从utils.js中使用工具方法写到这里
 * @type {Object}
 */
const utils = {
    addEvent: null,
    removeEvent: null,
    timemat: null,
    fullscreen: null,
    exitFullscreen: null,
    isFullscreen: null,
    addClass: null,
    removeClass: null,
    hasClass: null,
    indexOf: null
};
module.exports = {
    name: 'Player',
    utils,
    fn: function(type){
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

        if(type){
            video.style.display = 'none';
            utils.addClass(controls, 'player-controls-show');
            player.style.height = '36px';
            els.vthumb.parentNode.style.marginRight = els.fscreen.style.opacity = els.fscreen.style.width= 0;
        }

        utils.addEvent(video, 'durationchange', function(){
            els.dur.innerText = '/ ' + utils.timemat(this.duration);
        });
        utils.addEvent(video, 'timeupdate', function () {
            els.buf.style.width = (video.buffered.end(video.buffered.length-1) / this.duration) * 100 + '%';
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
            if(!type){
                if(timer) clearTimeout(timer);
                player.style.cursor = 'default';
                utils.addClass(controls, 'player-controls-show');
                timer = setTimeout(hideMouse, 2000);
            }
        });

        function hideMouse(){
            clearTimeout(timer);
            player.style.cursor = 'none';
            utils.removeClass(controls, 'player-controls-show');
        }

        player.appendChild(video);
        player.appendChild(controls);
        return {
            el: player,
            poster(src){
                video.poster = src;
            },
            src(src){
                video.src = src;
            }
        };
    }
};