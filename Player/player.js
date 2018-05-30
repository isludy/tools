var player = document.getElementById('player'),
    v = document.getElementById('player-video'),
    thumb = document.getElementById('player-slider-thumb'),
    vthumb = document.getElementById('player-volume-slider-thumb'),
    play = document.getElementById('player-btn'),
    curtime = document.getElementById('player-current-time'),
    dur = document.getElementById('player-duration'),
    fscreen = document.getElementById('player-fullscreen');
function timemat(time){
    var h = Math.floor(time/3600),
        i = Math.floor((time - h*3600) / 60),
        s = Math.floor(time - h*3600 - i*60);

    h = h < 10 ? '0' + h : h;
    i = i < 10 ? '0' + i : i;
    s = s < 10 ? '0' + s : s;
    return h + ':' + i + ':' + s;
}
v.addEventListener('durationchange', function () {
    dur.innerText = timemat(this.duration);
});
v.addEventListener('timeupdate', function () {
    curtime.innerText = timemat(this.currentTime);
    thumb.style.width = Math.round((this.currentTime / this.duration) * 100) + '%';
});
thumb.parentNode.addEventListener('mousedown', function(e){
    if(v.duration > 0){
        var percent = e.offsetX / this.offsetWidth;
        thumb.style.width = Math.round(percent * 100) + '%';
        v.currentTime = Math.round(percent * v.duration);
        curtime.innerText = timemat(v.currentTime);
    }
});
play.onclick = function(){
    if(v.paused){
        v.play();
        play.classList.add('player-btn-playing');
    }else{
        v.pause();
        play.classList.remove('player-btn-playing');
    }
};
vthumb.parentNode.addEventListener('mousedown', function(e){
    v.volume = e.offsetX / this.offsetWidth;
    vthumb.style.width = Math.round(v.volume * 100) + '%';
});
var isFull = false;
fscreen.onclick = function(){
    if(isFull){
        exitFullscreen();
        isFull = false;
    }else{
        fullscreen(player);
        isFull = true;
    }
};
function fullscreen(el) {
    if(el.requestFullscreen) {
        el.requestFullscreen();
    } else if(el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    } else if(el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    } else if(el.msRequestFullscreen) {
        el.msRequestFullscreen();
    }
}
function exitFullscreen() {
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if(document.msExitFullscreen){
        document.msExitFullscreen();
    }
}