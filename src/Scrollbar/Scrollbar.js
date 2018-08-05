import utils from '../../utils/utils';
import './Scrollbar.css';
class Scrollbar {
    /**
     * 必须的id
     * @param id
     */
    constructor(id){
        let isTouch = utils.isTouch();
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
            utils.wheel(this.content, function (e) {
                e.preventDefault();
                this.scrollTop += e.deltaY;
            },{passive: false});
        }
        if(this.scrollbar.x){
            this.thumb.x = this.scrollbar.x.querySelector('.scroll-thumb');
            Scrollbar.createScroll(this, 'x', 'offsetWidth', 'offsetLeft', 'width','left', 'scrollWidth', 'scrollLeft', 'clientX', 'offsetX', 'maxX', 'spaceX');
        }
    }
    /**
     * 创建属性和绑定事件，拖拽滚动条产生的动作。
     * 不应在外部定义或调用此方法
     * @param _
     * @param y
     * @param offsetHeight
     * @param offsetTop
     * @param height
     * @param top
     * @param scrollHeight
     * @param scrollTop
     * @param clientY
     * @param offsetY
     * @param maxY
     * @param spaceY
     * @returns {*}
     */
    static createScroll(_, y, offsetHeight, offsetTop, height, top, scrollHeight, scrollTop, clientY, offsetY, maxY, spaceY){
        let oh, sh, th, isTouch = utils.isTouch(), start = 0, end = 0, cur = 0, prev = 0, result = 0, dir = 0, prevent = {passive: false};

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
        _.scrollbar[y].addEventListener(_.events[0], function (e) {
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

    }

    /**
     * 移动端拖拽内容时
     * 不应在外部定义或调用此方法
     * @param _
     * @param scrollTop
     * @param clientY
     * @param maxY
     */
    static touchSscroll(_, scrollTop, clientY, maxY){
        let touchY = 0, end = 0, startTop = 0, prev = 0, speed = 0, prevent = {passive: false}, timer;
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
            let d = Math.abs(speed), dis = end-touchY, dir = dis < 0 ? 1 : -1;
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
    }

    /**
     * 隐藏滚动条。在移动端可能不需要显示滚动条，故提供此方法
     * @param which
     */
    hide(which){
        if(this.scrollbar[which].parentNode === this.body)
            this.body.removeChild(this.scrollbar[which]);
    }

    /**
     * 显示滚动条
     * @param which
     */
    show(which){
        if(this.scrollbar[which].parentNode !== this.body)
            this.body.appendChild(this.scrollbar[which]);
    }
}
export default Scrollbar;