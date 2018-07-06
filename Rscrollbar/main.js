import utils from '../utils/utils';

class Rscrollbar {
    constructor(id){
        this.body = document.getElementById(id);
        if(!this.body)
            throw new Error('Element is not found by id "'+id+'"');

        this.content = this.body.querySelector('.rscroll-content');
        this.scrollbar = {
            y: this.body.querySelector('.rscroll-y'),
            x: this.body.querySelector('.rscroll-x')
        };
        this.thumb = {
            y: null,
            x: null
        };

        if(this.scrollbar.y){
            this.thumb.y = this.scrollbar.y.querySelector('.rscroll-thumb');
            Rscrollbar.createScroll(this, 'y', 'offsetHeight', 'offsetTop', 'height','top', 'scrollHeight', 'scrollTop', 'clientY', 'offsetY', 'maxY', 'spaceY');
            utils.wheel(this.content, function (e) {
                this.scrollTop += e.deltaY;
            });
        }
        if(this.scrollbar.x){
            this.thumb.x = this.scrollbar.x.querySelector('.rscroll-thumb');
            Rscrollbar.createScroll(this, 'x', 'offsetWidth', 'offsetLeft', 'width','left', 'scrollWidth', 'scrollLeft', 'clientX', 'offsetX', 'maxX', 'spaceX');
        }
    }
    static createScroll(_, y, offsetHeight, offsetTop, height, top, scrollHeight, scrollTop, clientY, offsetY, maxY, spaceY){
        let oh, sh, th;
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
        _.scrollbar[y].addEventListener('mousedown', function (e) {
            if(e.button > 0 || _.thumb[y].contains(e.target)) return false;
            _.content[scrollTop] = e[offsetY]/this[offsetHeight] * _[maxY];
        });
        _.thumb[y].addEventListener('mousedown', function (e1) {
            let start = e1[clientY],
                end = start,
                cur = _.thumb[y][offsetTop],
                prev = start,
                result = 0;
            utils.addClass(document.body, 'rscroll-unselect');
            document.addEventListener('mousemove', moveFn);
            document.addEventListener('mouseup', endFn);
            function moveFn(e2){
                end = e2[clientY];
                result = end - start + cur;

                if(_.content[scrollTop] <= 0 && end - prev < 0){
                    start = end;
                    cur = _.thumb[y][scrollTop];
                    result = 0;
                }else if(_.content[scrollTop] >= _[maxY] && end - prev > 0){
                    start = end;
                    cur = _.thumb[y][offsetTop];
                    result = _[spaceY];
                }
                _.thumb[y].style[top] = result + 'px';
                _[scrollTop] = (result / _[spaceY])*_[maxY];
                prev = end;
            }
            function endFn(){
                document.removeEventListener('mousemove', moveFn);
                document.removeEventListener('mouseup', endFn);
                utils.removeClass(document.body, 'rscroll-unselect');
            }
        });
    }
}
export default Rscrollbar;