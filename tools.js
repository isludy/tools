!function(r){var e={};function n(t){if(e[t])return e[t].exports;var o=e[t]={i:t,l:!1,exports:{}};return r[t].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=r,n.c=e,n.d=function(r,e,t){n.o(r,e)||Object.defineProperty(r,e,{enumerable:!0,get:t})},n.r=function(r){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})},n.t=function(r,e){if(1&e&&(r=n(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var t=Object.create(null);if(n.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var o in r)n.d(t,o,function(e){return r[e]}.bind(null,o));return t},n.n=function(r){var e=r&&r.__esModule?function(){return r.default}:function(){return r};return n.d(e,"a",e),e},n.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},n.p="",n(n.s=0)}([function(r,e,n){"use strict";var t=function(){function r(r,e){for(var n=0;n<e.length;n++){var t=e[n];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(r,t.key,t)}}return function(e,n,t){return n&&r(e.prototype,n),t&&r(e,t),e}}(),o=function(r){return r&&r.__esModule?r:{default:r}}(n(1));n(2);var l=/player-lrc-mode-[0-9]+/g,i=function(){function r(e){!function(r,e){if(!(r instanceof e))throw new TypeError("Cannot call a class as a function")}(this,r);var n=document.querySelector(e);n&&(this.lrcData=null,this.lrcKeys=null,this.lrcLen=0,this.showLrcLines=7,this.__define__("xhr",{value:new XMLHttpRequest}),this.__define__("timer",{writable:!0,value:0}),this.__dom__(),this.__obs__(),n.appendChild(this[0]),this.__events__(),this.volume=.5,this.__define__("private",{value:1}))}return t(r,[{key:"__dom__",value:function(){r.__check__(this.private,"__dom__"),this[0]=document.createElement("div"),this[0].className="player player-1",this[0].innerHTML='\n        <video data-name="video" class="player-video"></video>\n        <div data-name="lrc" class="player-lrc"></div>\n        <div data-name="ctrls" class="player-controls">\n            <div class="player-slider" title="播放时间滑块">\n                <div data-name="buf" class="player-slider-buf"></div>\n                <div data-name="thumb" class="player-slider-thumb"></div>\n            </div>\n            <div class="player-toolbar">\n                <div class="player-toolbar-left">\n                    <div data-name="btn" class="player-btn" title="播放/暂时"></div>\n                    <div data-name="cur" class="player-current-time">--:--</div>\n                    <div data-name="dur" class="player-duration">/ --:--</div>\n                </div>\n                <div class="player-toolbar-right">\n                    <div data-name="vbtn" class="player-vol-btn" title="音量">\n                        <i class="player-vol-rect"></i>\n                        <i class="player-vol-tri"></i>\n                        <i class="player-vol-stat">\n                            <i class="player-vol-dot1"></i>\n                            <i class="player-vol-dot2"></i>\n                            <i class="player-vol-dot3"></i>\n                            <i class="player-vol-mute">&times;</i>\n                        </i>\n                        <div class="player-vol-slidebar">\n                            <div class="player-vol-slide-track">\n                                <div data-name="vslider" class="player-vol-slider"></div>\n                            </div>\n                        </div>\n                    </div>\n                    <div data-name="rate" class="player-rate" title="播放速率">1x</div>\n                    <div data-name="fscreen" class="player-fullscreen" title="全屏切换">\n                        <i class="player-fullscreen-tl"></i>\n                        <i class="player-fullscreen-tr"></i>\n                        <i class="player-fullscreen-bl"></i>\n                        <i class="player-fullscreen-br"></i>\n                    </div>\n                </div>\n            </div>\n        </div>',this.els={loading:document.createElement("div")},this.els.loading.className="r-loading";for(var e=this[0].querySelectorAll("[data-name]"),n=e.length,t=0;t<n;t++)this.els[e[t].getAttribute("data-name")]=e[t],e[t].removeAttribute("data-name")}},{key:"__define__",value:function(e,n){r.__check__(this.private,"__define__"),Object.defineProperty(this,e,n)}},{key:"__ob__",value:function(e,n){r.__check__(this.private,"__ob__");var t=void 0;this.__define__(e,{set:function(r){r!==t&&(t=r,n(r))},get:function(){return t}})}},{key:"__obs__",value:function(){r.__check__(this.private,"__obs__");var e=this;e.__ob__("src",function(r){e.lrc="",e.lrcData=null,e.lrcKeys=null,e.lrcLen=0,e.poster="",e.els.video.src=r}),e.__ob__("poster",function(r){r?e.els.video.poster=r:e.els.video.removeAttribute("poster")}),e.__ob__("currentTime",function(r){e.els.cur.innerText=o.default.timemat(r),e.els.thumb.style.width=r/e.duration*100+"%",e.getLrcActive(r)}),e.__ob__("volume",function(r){e.els.video.volume=r,e.els.vslider.style.height=100*r+"%"}),e.__ob__("activeIndex",function(){e.renderLrc()})}},{key:"__events__",value:function(){r.__check__(this.private,"__events__");var e=this,n=e.els.video,t=e.els.btn,l=e.els.loading;o.default.on(window,"resize",function(){e.setLrcMode()}),o.default.on(n,"loadstart",function(){e[0].appendChild(l)}),o.default.on(n,"durationchange",function(){e.duration=this.duration,e.currentTime=0,e.els.dur.innerText="/ "+o.default.timemat(this.duration),e.els.video.playbackRate=parseFloat(e.els.rate.innerText),e.loadLrc()}),o.default.on(n,"loadeddata",function(){e[0].removeChild(l)}),o.default.on(n,"error",function(){l.innerHTML="加载失败",o.default.addClass(l,"r-loadend"),o.default.removeClass(l,"r-loading")}),o.default.on(t,"click",function(){n.paused?(n.play(),n.autoplay=!0,o.default.addClass(t,"player-btn-playing")):(n.pause(),n.autoplay=!1,o.default.removeClass(t,"player-btn-playing"))}),o.default.on(n,"timeupdate",function(){try{e.els.buf.style.width=n.buffered.end(n.buffered.length-1)/this.duration*100+"%"}catch(r){}e.currentTime=this.currentTime}),o.default.on(e.els.thumb.parentNode,"click",function(r){if(n.duration>0){var t=r.offsetX/this.offsetWidth;e.currentTime=t*n.duration,n.currentTime=Math.round(t*n.duration)}}),o.default.on(e.els.vslider.parentNode,"click",function(r){var n=this.getBoundingClientRect();e.volume=(n.bottom-r.clientY)/n.height}),o.default.on(e.els.vbtn,"click",function(r){e.els.vslider.parentNode.parentNode.contains(r.target)||((n.muted=!n.muted)?o.default.addClass(e[0],"player-muted"):o.default.removeClass(e[0],"player-muted"))},!0),o.default.on(e.els.rate,"click",function(){var r=parseFloat(this.innerText);(r+=.25)>2&&(r=.25),e.els.video.playbackRate=r,this.innerText=r+"x"}),o.default.on(e.els.fscreen,"click",function(){o.default.isFullscreen()?(o.default.exitFullscreen(),o.default.removeClass(e.els.fscreen,"player-fullscreen-on")):(o.default.fullscreen(e[0]),o.default.addClass(e.els.fscreen,"player-fullscreen-on"))}),o.default.on(e[0],"mousemove",function(r){e.timer&&clearTimeout(e.timer),e.els.ctrls.contains(r.target)||(e.showMouse(),e.timer=setTimeout(function(){e.hideMouse()},2e3))}),o.default.on(e[0],"mouseleave",function(){e.hideMouse()})}},{key:"showMouse",value:function(){clearTimeout(this.timer),this[0].style.cursor="default",o.default.addClass(this.els.ctrls,"player-controls-show")}},{key:"hideMouse",value:function(){clearTimeout(this.timer),this[0].style.cursor="none",o.default.removeClass(this.els.ctrls,"player-controls-show")}},{key:"loadLrc",value:function(){var r=this;r.els.lrc.innerHTML="",this.lrc&&(this.xhr.open("get",this.lrc,!0),r.xhr.onreadystatechange=function(){if(4===r.xhr.readyState){var e="[00:00.00]找不到歌词/字幕";200===r.xhr.status&&(e=r.xhr.responseText),r.readLrc(e),r.showLrc(),r.setLrcMode()}},r.xhr.send())}},{key:"readLrc",value:function(r){var e=this,n=void 0;r&&(n=r.split(/\n+/),e.lrcData={},n.forEach(function(r){r.replace(/\[([0-9:.\[\]]+)\]/gi,function(n,t){if(n=r.slice(r.lastIndexOf("]")+1).replace(/\s+/g,""))for(var l=t.split(/\]\s*\[/),i=l.length,a=0;a<i;a++){var s=o.default.time(l[a]);e.lrcData[s]?e.lrcData[s]+="<br>"+n:e.lrcData[s]=n}})}),r=null,n=null,e.lrcKeys=Object.keys(e.lrcData),e.lrcKeys.sort(function(r,e){return Number(r)-Number(e)}),e.lrcLen=e.lrcKeys.length,e.activeIndex=0)}},{key:"getLrcActive",value:function(r){for(var e=0;e<this.lrcLen;e++){if(parseFloat(this.lrcKeys[e])-r>=0){this.lrcKeys[e-1]&&(this.activeIndex=e-1);break}}}},{key:"showLrc",value:function(){o.default.addClass(this.els.lrc,"player-lrc-show")}},{key:"hideLrc",value:function(){o.default.removeClass(this.els.lrc,"player-lrc-show")}},{key:"renderLrc",value:function(){if(1===this.lrcMode){this.els.lrc.innerHTML="";for(var r=this.showLrcLines,e=Math.floor(r/2),n=Math.round(100/(e+1)),t=0,o=0,l=n;t<r;t++)(o=this.activeIndex+t-e)<=this.activeIndex?l+=n:l-=n,this.lrcKeys[o]&&(this.els.lrc.innerHTML+='<div class="player-lrc-line'+(o===this.activeIndex?" player-lrc-line-active":"")+'" style="opacity: '+(l-n)/100+';">'+this.lrcData[this.lrcKeys[o]]+"</div>")}else this.els.lrc.innerHTML='<div class="player-lrc-line player-lrc-line-active">'+this.lrcData[this.lrcKeys[this.activeIndex]]+"</div>"}},{key:"setLrcMode",value:function(r){"number"==typeof r&&(this.lrcMode=r),this.lrcKeys&&this.renderLrc(),l.test(this.els.lrc.className)?this.els.lrc.className=this.els.lrc.className.replace(l,"player-lrc-mode-"+(this.lrcMode||0)):this.els.lrc.className+=" player-lrc-mode-"+(this.lrcMode||0);var e=this.els.lrc.children[0],n=32,t=void 0;e&&(n=e.offsetHeight+(Number(o.default.calced(e,"lineHeight"))||0)),t=1===this.lrcMode?(this[0].offsetHeight-n*this.showLrcLines)/2:this[0].offsetHeight-2*n,o.default.transform(this.els.lrc,"translateY("+t+"px)")}},{key:"setLrcLines",value:function(r){"number"==typeof r&&(this.showLrcLines=r,1===this.lrcMode&&this.setLrcMode())}}],[{key:"__check__",value:function(r,e){if(1===r)throw TypeError(e+"是私有方法，不可调用")}},{key:"toString",value:function(){return"{ [ class Player ] }"}}]),r}();window.Player=i},function(r,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default={timemat:function(r){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=e?Math.floor(r/3600):0,t=Math.floor((r-3600*n)/60),o=Math.floor(r-3600*n-60*t);return n=n<10?"0"+n:n,t=t<10?"0"+t:t,o=o<10?"0"+o:o,(e?n+":":"")+t+":"+o},on:function(r,e,n){for(var t=arguments.length>3&&void 0!==arguments[3]&&arguments[3],o=window.addEventListener,l=window.attachEvent,i=1===r.nodeType||r===document||r===window?[r]:r,a=i.length,s=0;s<a;s++)3!==i[s].nodeType&&(o?i[s].addEventListener(e,n,t):l&&i[s].attachEvent("on"+e,n))},addClass:function(r,e){if(r.classList)r.classList.add(e);else{var n=r.className.split(/\s+/);-1===this.indexOf(n,e)&&n.push(e),r.className=n.join(" ")}},removeClass:function(r,e){if(r.classList)r.classList.remove(e);else{var n,t=r.className.split(/\s+/);-1!==(n=this.indexOf(t,e))&&t.splice(n,1),r.className=t.join(" ")}},isFullscreen:function(){return document.fullscreen||document.webkitIsFullScreen||document.mozFullScreen||!1},exitFullscreen:function(){document.exitFullscreen?document.exitFullscreen():document.webkitCancelFullScreen?document.webkitCancelFullScreen():document.webkitExitFullscreen?document.webkitExitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.msExitFullscreen&&document.msExitFullscreen()},fullscreen:function(r){r.requestFullscreen?r.requestFullscreen():r.webkitRequestFullscreen?r.webkitRequestFullscreen():r.mozRequestFullScreen?r.mozRequestFullScreen():r.msRequestFullscreen&&r.msRequestFullscreen()},time:function(r){var e=r.split(/[:：]+/);return 3===e.length?3600*parseInt(e[0])+60*parseInt(e[1])+parseFloat(e[2]):60*parseInt(e[0])+parseFloat(e[1])},calced:function(r,e){return r&&1===r.nodeType?window.getComputedStyle?window.getComputedStyle(r)[e]:r.currentStyle[e]:0},transform:function(r,e){if("transform"in document.documentElement.style)r.style.webkitTransform=r.style.mozTransform=r.style.msTransform=r.style.oTransform=r.style.transform=e;else if(/translateY/.test(e))r.style.top=e;else if(/translateX/.test(e))r.style.left=e;else if(/scaleY/.test(e)){var n=r.offsetHeight;r.style.height=n*parseFloat(e)+"px"}else if(/scaleX/.test(e)){var t=r.offsetWidth;r.style.width=t*parseFloat(e)+"px"}},indexOf:function(r,e){if(r.indexOf)return r.indexOf(e);for(var n=0,t=r.length;n<t;n++)if(r[n]===e)return n;return-1}}},function(r,e,n){var t=n(3);"string"==typeof t&&(t=[[r.i,t,""]]);var o={hmr:!0,transform:void 0,insertInto:void 0};n(5)(t,o);t.locals&&(r.exports=t.locals)},function(r,e,n){(r.exports=n(4)(!1)).push([r.i,".player{\r\n    display: block;\r\n    position: relative;\r\n    cursor: default;\r\n    -webkit-box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n    box-sizing: border-box;\r\n    width: 100%;\r\n    overflow: hidden;\r\n    background-color: #111;\r\n}\r\n.player-video{\r\n    width: 100%;\r\n    height: 100%;\r\n    display: block;\r\n}\r\n.player-lrc{\r\n    display: none;\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    width: 100%;\r\n    height: 100%;\r\n    text-align: center;\r\n    color: #fff;\r\n    font-size: 32px;\r\n    z-index: 1;\r\n}\r\n.player-lrc-show{\r\n    display: block;\r\n}\r\n.player-lrc-mode-1{\r\n    font-size: 16px;\r\n    line-height: 1.8;\r\n}\r\n.player-lrc-line{\r\n    opacity: 0;\r\n}\r\n.player-lrc-line-active{\r\n    color: #ff862a;\r\n    opacity: 1;\r\n}\r\n.player-table{\r\n    display: block;\r\n    position: absolute;\r\n    width: 100%;\r\n    height: 100%;\r\n    top: 0;\r\n    left: 0;\r\n    vertical-align: middle;\r\n    text-align: center;\r\n    z-index: 0;\r\n}\r\n.player-controls{\r\n    background-color: #333;\r\n    position: absolute;\r\n    width: 100%;\r\n    bottom: 0;\r\n    left: 0;\r\n    color: #fff;\r\n    -webkit-transform: translateY(100%);\r\n    -moz-transform: translateY(100%);\r\n    -ms-transform: translateY(100%);\r\n    -o-transform: translateY(100%);\r\n    transform: translateY(100%);\r\n    -webkit-transition: all .5s;\r\n    -moz-transition: all .5s;\r\n    -ms-transition: all .5s;\r\n    -o-transition: all .5s;\r\n    transition: all .5s;\r\n    z-index: 2;\r\n}\r\n.player-controls-show{\r\n    -webkit-transform: translateY(0);\r\n    -moz-transform: translateY(0);\r\n    -ms-transform: translateY(0);\r\n    -o-transform: translateY(0);\r\n    transform: translateY(0);\r\n}\r\n.player-controls:hover{\r\n    -webkit-transform: translateY(0);\r\n    -moz-transform: translateY(0);\r\n    -ms-transform: translateY(0);\r\n    -o-transform: translateY(0);\r\n    transform: translateY(0);\r\n}\r\n.player-slider{\r\n    background-color: #525050;\r\n    height: 6px;\r\n    cursor: pointer;\r\n    position: relative;\r\n}\r\n.player-slider-buf,\r\n.player-slider-thumb{\r\n    position: absolute;\r\n    top: 0;\r\n    left: 0;\r\n    height: 100%;\r\n    width: 0;\r\n}\r\n.player-slider-buf{\r\n    background-color: #999;\r\n    width: 0;\r\n    z-index: 0;\r\n}\r\n.player-slider-thumb{\r\n    z-index: 1;\r\n    background-color: #2aa126;\r\n}\r\n.player-toolbar{\r\n    position: relative;\r\n    -webkit-box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n    box-sizing: border-box;\r\n    white-space: nowrap;\r\n    font-size: 0;\r\n}\r\n.player-toolbar::after{\r\n    content: '';\r\n    clear: both;\r\n    display: block;\r\n    height: 0;\r\n}\r\n.player-toolbar-left{\r\n    float: left;\r\n}\r\n.player-toolbar-right{\r\n    float: right;\r\n}\r\n.player-toolbar-left::before,\r\n.player-toolbar-right::after{\r\n    content: '';\r\n    display: inline-block;\r\n    height: 32px;\r\n    width: 8px;\r\n    vertical-align: middle;\r\n}\r\n.player-btn,\r\n.player-current-time,\r\n.player-duration,\r\n.player-volume-slider,\r\n.player-fullscreen,\r\n.player-vol-btn,\r\n.player-vol-rect,\r\n.player-vol-tri,\r\n.player-vol-stat,\r\n.player-vol-mute,\r\n.player-rate{\r\n    display: inline-block;\r\n    *display: inline;\r\n    *zoom: 1;\r\n    vertical-align: middle;\r\n    -webkit-box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n    box-sizing: border-box;\r\n    position: relative;\r\n}\r\n.player-btn{\r\n    cursor: pointer;\r\n    width: 0;\r\n    height: 0;\r\n    color: #999;\r\n    border-left: 12px solid;\r\n    border-top: 8px solid transparent;\r\n    border-bottom: 8px solid transparent;\r\n    margin: 0 10px;\r\n}\r\n.player-btn:hover{\r\n    color: #fff;\r\n}\r\n.player-btn-playing{\r\n    border-left: 4px solid;\r\n    border-right: 4px solid;\r\n    border-top: 0;\r\n    border-bottom: 0;\r\n    width: 12px;\r\n    height: 14px;\r\n}\r\n.player-current-time,\r\n.player-duration{\r\n    font-size: 14px;\r\n    padding: 0 2px;\r\n}\r\n.player-duration{\r\n    color: #ddd;\r\n}\r\n.player-vol-btn,\r\n.player-vol-slidebar,\r\n.player-vol-slide-track,\r\n.player-rate,\r\n.player-fullscreen{\r\n    -webkit-border-radius: 3px;\r\n    -moz-border-radius: 3px;\r\n    border-radius: 3px;\r\n}\r\n.player-vol-btn{\r\n    height: 22px;\r\n    width: 32px;\r\n    font-size: 0;\r\n    cursor: pointer;\r\n    margin-right: 8px;\r\n    color: #999;\r\n    padding: 3px;\r\n}\r\n.player-vol-btn:hover{\r\n    color: #fff;\r\n    background-color: #222;\r\n}\r\n.player-vol-rect{\r\n    border-top: 6px solid;\r\n    width: 3px;\r\n    height: 0;\r\n}\r\n.player-vol-tri{\r\n    border-right: 12px solid;\r\n    border-top: 5px solid transparent;\r\n    border-bottom: 5px solid transparent;\r\n    width: 0;\r\n    height: 16px;\r\n}\r\n.player-vol-stat{\r\n    font-size: 16px;\r\n    margin-left: 4px;\r\n}\r\n.player-vol-dot1,\r\n.player-vol-dot2,\r\n.player-vol-dot3{\r\n    border-top: 2px solid;\r\n    width: 3px;\r\n    height: 0;\r\n    display: block;\r\n}\r\n.player-vol-dot2{\r\n    margin: 3px 2px;\r\n}\r\n.player-vol-mute{\r\n    font-size: 20px;\r\n    line-height: 16px;\r\n    font-family: Arial, sans-serif !important;\r\n    display: none;\r\n}\r\n.player-muted .player-vol-dot1,\r\n.player-muted .player-vol-dot2,\r\n.player-muted .player-vol-dot3{\r\n    display: none;\r\n}\r\n.player-muted .player-vol-mute{\r\n    display: block;\r\n}\r\n.player-muted .player-vol-stat{\r\n    margin-left: 0;\r\n}\r\n.player-muted .player-volume-slider-thumb{\r\n    display: none;\r\n}\r\n.player-vol-slidebar{\r\n    position: absolute;\r\n    bottom: 110%;\r\n    left: -2px;\r\n    background-color: #222;\r\n    width: 36px;\r\n    height: 120px;\r\n    -webkit-transition: all .3s;\r\n    -moz-transition: all .3s;\r\n    -ms-transition: all .3s;\r\n    -o-transition: all .3s;\r\n    transition: all .3s;\r\n    -webkit-transform: scaleY(0);\r\n    -moz-transform: scaleY(0);\r\n    -ms-transform: scaleY(0);\r\n    -o-transform: scaleY(0);\r\n    transform: scaleY(0);\r\n    -webkit-transform-origin: bottom;\r\n    -moz-transform-origin: bottom;\r\n    -ms-transform-origin: bottom;\r\n    -o-transform-origin: bottom;\r\n    transform-origin: bottom;\r\n}\r\n.player-vol-btn:hover .player-vol-slidebar{\r\n    -webkit-transform: scaleY(1);\r\n    -moz-transform: scaleY(1);\r\n    -ms-transform: scaleY(1);\r\n    -o-transform: scaleY(1);\r\n    transform: scaleY(1);\r\n}\r\n.player-vol-slide-track{\r\n    height: 100px;\r\n    width: 6px;\r\n    background: #bbb;\r\n    margin: 10px 15px;\r\n    overflow: hidden;\r\n    position: relative;\r\n}\r\n.player-vol-slider{\r\n    width: 100px;\r\n    height: 50%;\r\n    background-color: #2aa126;\r\n    position: absolute;\r\n    left: 0;\r\n    bottom: 0;\r\n}\r\n.player-rate{\r\n    font-size: 14px;\r\n    padding: 4px;\r\n    line-height: 1;\r\n    text-align: center;\r\n    margin: 1px 5px;\r\n    cursor: pointer;\r\n}\r\n.player-rate:hover{\r\n    background-color: #222;\r\n}\r\n.player-fullscreen{\r\n    width: 22px;\r\n    height: 22px;\r\n    margin-left: 8px;\r\n    cursor: pointer;\r\n    border: 3px solid transparent;\r\n}\r\n.player-fullscreen:hover{\r\n    background-color: #222;\r\n    border-color: #222;\r\n}\r\n.player-fullscreen-tl,\r\n.player-fullscreen-tr,\r\n.player-fullscreen-bl,\r\n.player-fullscreen-br{\r\n    position: absolute;\r\n    width: 4px;\r\n    height: 4px;\r\n    border-width: 2px;\r\n}\r\n.player-fullscreen-tl{\r\n    top: 0;\r\n    left: 0;\r\n    border-left-style: solid;\r\n    border-top-style: solid;\r\n}\r\n.player-fullscreen-tr{\r\n    top: 0;\r\n    right: 0;\r\n    border-top-style: solid;\r\n    border-right-style: solid;\r\n}\r\n.player-fullscreen-bl{\r\n    left: 0;\r\n    bottom: 0;\r\n    border-left-style: solid;\r\n    border-bottom-style: solid;\r\n}\r\n.player-fullscreen-br{\r\n    right: 0;\r\n    bottom: 0;\r\n    border-right-style: solid;\r\n    border-bottom-style: solid;\r\n}\r\n.player-fullscreen-on .player-fullscreen-tl{\r\n    border-style: none;\r\n    border-right-style: solid;\r\n    border-bottom-style: solid;\r\n}\r\n.player-fullscreen-on .player-fullscreen-tr{\r\n    border-style: none;\r\n    border-bottom-style: solid;\r\n    border-left-style: solid;\r\n}\r\n.player-fullscreen-on .player-fullscreen-bl{\r\n    border-style: none;\r\n    border-right-style: solid;\r\n    border-top-style: solid;\r\n}\r\n.player-fullscreen-on .player-fullscreen-br{\r\n    border-style: none;\r\n    border-left-style: solid;\r\n    border-top-style: solid;\r\n}\r\n\r\n.r-loading,\r\n.r-loadend{\r\n    position: absolute;\r\n    width: 120px;\r\n    height: 80px;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n    margin: auto;\r\n    background-color: rgba(0, 0, 0, .5);\r\n    border-radius: 4px;\r\n    color: #fff;\r\n    text-align: center;\r\n    line-height: 80px;\r\n}\r\n.r-loading::before,\r\n.r-loading::after{\r\n    content: '';\r\n    position: absolute;\r\n    margin: auto;\r\n    top: 0;\r\n    right: 0;\r\n    bottom: 0;\r\n    left: 0;\r\n    -webkit-animation: rotating 1s infinite;\r\n    -o-animation: rotating 1s infinite;\r\n    animation: rotating 1s infinite;\r\n}\r\n.r-loading::before{\r\n    width: 36px;\r\n    height: 36px;\r\n    border-radius: 100%;\r\n    border: 4px solid #fff;\r\n    border-left: 4px solid transparent;\r\n    border-right: 4px solid transparent;\r\n}\r\n.r-loading::after{\r\n    width: 36px;\r\n    height: 8px;\r\n    border-left: 4px solid #fff;\r\n    border-right: 4px solid #fff;\r\n}\r\n\r\n@keyframes rotating {\r\n    from{\r\n        transform: rotateZ(0);\r\n    }\r\n    to{\r\n        transform: rotateZ(360deg);\r\n    }\r\n}\r\n\r\n",""])},function(r,e){r.exports=function(r){var e=[];return e.toString=function(){return this.map(function(e){var n=function(r,e){var n=r[1]||"",t=r[3];if(!t)return n;if(e&&"function"==typeof btoa){var o=function(r){return"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */"}(t),l=t.sources.map(function(r){return"/*# sourceURL="+t.sourceRoot+r+" */"});return[n].concat(l).concat([o]).join("\n")}return[n].join("\n")}(e,r);return e[2]?"@media "+e[2]+"{"+n+"}":n}).join("")},e.i=function(r,n){"string"==typeof r&&(r=[[null,r,""]]);for(var t={},o=0;o<this.length;o++){var l=this[o][0];"number"==typeof l&&(t[l]=!0)}for(o=0;o<r.length;o++){var i=r[o];"number"==typeof i[0]&&t[i[0]]||(n&&!i[2]?i[2]=n:n&&(i[2]="("+i[2]+") and ("+n+")"),e.push(i))}},e}},function(r,e,n){var t={},o=function(r){var e;return function(){return void 0===e&&(e=r.apply(this,arguments)),e}}(function(){return window&&document&&document.all&&!window.atob}),l=function(r){var e={};return function(r){if("function"==typeof r)return r();if(void 0===e[r]){var n=function(r){return document.querySelector(r)}.call(this,r);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(r){n=null}e[r]=n}return e[r]}}(),i=null,a=0,s=[],c=n(6);function d(r,e){for(var n=0;n<r.length;n++){var o=r[n],l=t[o.id];if(l){l.refs++;for(var i=0;i<l.parts.length;i++)l.parts[i](o.parts[i]);for(;i<o.parts.length;i++)l.parts.push(b(o.parts[i],e))}else{var a=[];for(i=0;i<o.parts.length;i++)a.push(b(o.parts[i],e));t[o.id]={id:o.id,refs:1,parts:a}}}}function u(r,e){for(var n=[],t={},o=0;o<r.length;o++){var l=r[o],i=e.base?l[0]+e.base:l[0],a={css:l[1],media:l[2],sourceMap:l[3]};t[i]?t[i].parts.push(a):n.push(t[i]={id:i,parts:[a]})}return n}function f(r,e){var n=l(r.insertInto);if(!n)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var t=s[s.length-1];if("top"===r.insertAt)t?t.nextSibling?n.insertBefore(e,t.nextSibling):n.appendChild(e):n.insertBefore(e,n.firstChild),s.push(e);else if("bottom"===r.insertAt)n.appendChild(e);else{if("object"!=typeof r.insertAt||!r.insertAt.before)throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");var o=l(r.insertInto+" "+r.insertAt.before);n.insertBefore(e,o)}}function p(r){if(null===r.parentNode)return!1;r.parentNode.removeChild(r);var e=s.indexOf(r);e>=0&&s.splice(e,1)}function h(r){var e=document.createElement("style");return void 0===r.attrs.type&&(r.attrs.type="text/css"),y(e,r.attrs),f(r,e),e}function y(r,e){Object.keys(e).forEach(function(n){r.setAttribute(n,e[n])})}function b(r,e){var n,t,o,l;if(e.transform&&r.css){if(!(l=e.transform(r.css)))return function(){};r.css=l}if(e.singleton){var s=a++;n=i||(i=h(e)),t=v.bind(null,n,s,!1),o=v.bind(null,n,s,!0)}else r.sourceMap&&"function"==typeof URL&&"function"==typeof URL.createObjectURL&&"function"==typeof URL.revokeObjectURL&&"function"==typeof Blob&&"function"==typeof btoa?(n=function(r){var e=document.createElement("link");return void 0===r.attrs.type&&(r.attrs.type="text/css"),r.attrs.rel="stylesheet",y(e,r.attrs),f(r,e),e}(e),t=function(r,e,n){var t=n.css,o=n.sourceMap,l=void 0===e.convertToAbsoluteUrls&&o;(e.convertToAbsoluteUrls||l)&&(t=c(t));o&&(t+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */");var i=new Blob([t],{type:"text/css"}),a=r.href;r.href=URL.createObjectURL(i),a&&URL.revokeObjectURL(a)}.bind(null,n,e),o=function(){p(n),n.href&&URL.revokeObjectURL(n.href)}):(n=h(e),t=function(r,e){var n=e.css,t=e.media;t&&r.setAttribute("media",t);if(r.styleSheet)r.styleSheet.cssText=n;else{for(;r.firstChild;)r.removeChild(r.firstChild);r.appendChild(document.createTextNode(n))}}.bind(null,n),o=function(){p(n)});return t(r),function(e){if(e){if(e.css===r.css&&e.media===r.media&&e.sourceMap===r.sourceMap)return;t(r=e)}else o()}}r.exports=function(r,e){if("undefined"!=typeof DEBUG&&DEBUG&&"object"!=typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");(e=e||{}).attrs="object"==typeof e.attrs?e.attrs:{},e.singleton||"boolean"==typeof e.singleton||(e.singleton=o()),e.insertInto||(e.insertInto="head"),e.insertAt||(e.insertAt="bottom");var n=u(r,e);return d(n,e),function(r){for(var o=[],l=0;l<n.length;l++){var i=n[l];(a=t[i.id]).refs--,o.push(a)}r&&d(u(r,e),e);for(l=0;l<o.length;l++){var a;if(0===(a=o[l]).refs){for(var s=0;s<a.parts.length;s++)a.parts[s]();delete t[a.id]}}}};var m=function(){var r=[];return function(e,n){return r[e]=n,r.filter(Boolean).join("\n")}}();function v(r,e,n,t){var o=n?"":t.css;if(r.styleSheet)r.styleSheet.cssText=m(e,o);else{var l=document.createTextNode(o),i=r.childNodes;i[e]&&r.removeChild(i[e]),i.length?r.insertBefore(l,i[e]):r.appendChild(l)}}},function(r,e){r.exports=function(r){var e="undefined"!=typeof window&&window.location;if(!e)throw new Error("fixUrls requires window.location");if(!r||"string"!=typeof r)return r;var n=e.protocol+"//"+e.host,t=n+e.pathname.replace(/\/[^\/]*$/,"/");return r.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,function(r,e){var o,l=e.trim().replace(/^"(.*)"$/,function(r,e){return e}).replace(/^'(.*)'$/,function(r,e){return e});return/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(l)?r:(o=0===l.indexOf("//")?l:0===l.indexOf("/")?n+l:t+l.replace(/^\.\//,""),"url("+JSON.stringify(o)+")")})}}]);