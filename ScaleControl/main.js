import utils from '../utils/utils';

class ScaleControl {
    constructor(){
        let box = document.createElement('div'),
            points = {
                topLeft: box.cloneNode(),
                topCenter: box.cloneNode(),
                topRight: box.cloneNode(),
                midLeft: box.cloneNode(),
                midCenter: box.cloneNode(),
                midRight: box.cloneNode(),
                bottomLeft: box.cloneNode(),
                bottomCenter: box.cloneNode(),
                bottomRight: box.cloneNode()
            },
            test = /[A-Z]/g;

        box.className = 'scale-control';

        for(let k in points){
            points[k].className = 'scale-control-point scale-control-' + k.replace(test, function($0){
                return '-'+$0.toLowerCase();
            });
            box.appendChild(points[k]);
        }
        this.matrix = [0,0,0,0,0,0];
        this.points = points;
        this[0] = box;
        this.el = null;
        ScaleControl.bindEvent(this);
    }
    bind(el){
        if(el && el.nodeType === 1){
            this.matrix[0] = el.offsetLeft;
            this.matrix[1] = el.offsetTop;
            this.matrix[2] = el.offsetWidth;
            this.matrix[3] = el.offsetHeight;
            if(this.el !== el){
                this.matrix[4] = el.offsetWidth;
                this.matrix[5] = el.offsetHeight;
            }
            this.el = el;
            el.parentNode.appendChild(this[0]);
            ScaleControl.fixToEl(el, this[0]);
        }
    }
    unbind(){
        this.matrix[0] = this.matrix[1] = this.matrix[2] = this.matrix[3] = this.matrix[4] = this.matrix[5] = 0;
        if(this[0].parentNode)
            this[0].parentNode.removeChild(this[0]);
    }
    contains(target){
        return utils.contains(target, this[0]);
    }
    static fixToEl(el, box){
        box.style.top = el.offsetTop + 'px';
        box.style.left = el.offsetLeft + 'px';
        box.style.width = el.offsetWidth + 'px';
        box.style.height = el.offsetHeight + 'px';
    }
    static bindEvent(_this){
        let w, h, pX, pY, startX, startY, endX, endY, isX, isY, isMove, isLeft, isTop,
            box = _this[0],
            points = _this.points;

        function moveHandler(e){
            if(isMove){
                _this.matrix[0] = pX + e.clientX - startX;
                _this.matrix[1] = pY + e.clientY - startY;
                box.style.left = _this.matrix[0] + 'px';
                box.style.top = _this.matrix[1] + 'px';
            }else{
                if(isX){
                    if(isLeft){
                        _this.matrix[0] = pX + e.clientX - startX;
                        _this.matrix[2] = w - e.clientX + startX;
                        box.style.left = _this.matrix[0] + 'px';
                        box.style.width = _this.matrix[2] + 'px';
                    }else{
                        _this.matrix[2] = w + e.clientX - startX;
                        box.style.width = _this.matrix[2] + 'px';
                    }
                }
                if(isY){
                    if(isTop){
                        _this.matrix[1] = pY + e.clientY - startY;
                        _this.matrix[3] = h - e.clientY + startY;
                        box.style.top = _this.matrix[1] + 'px';
                        box.style.height = _this.matrix[3] + 'px';
                    }else{
                        _this.matrix[3] = h + e.clientY - startY;
                        box.style.height = _this.matrix[3] + 'px';
                    }
                }
                if(e.shiftKey){
                    _this.matrix[3] = box.offsetWidth * (_this.matrix[5] / _this.matrix[4]);
                    box.style.height = _this.matrix[3] + 'px';
                }
            }

            _this.el.style.left = _this.matrix[0] + 'px';
            _this.el.style.top = _this.matrix[1] + 'px';
            _this.el.style.width = _this.matrix[2] + 'px';
            _this.el.style.height = _this.matrix[3] + 'px';

            ScaleControl.fixToEl(_this.el, box);
        }

        function upHandler(){
            utils.removeClass(_this.el, 'scale-control-unselect');
            utils.removeEvent(document, 'mousemove', moveHandler);
            utils.removeEvent(document, 'mouseup', upHandler);
        }

        utils.addEvent(_this[0], 'mousedown', function (e) {
            let target = e.target;
            utils.addClass(_this.el, 'scale-control-unselect');

            w = box.offsetWidth;
            h = box.offsetHeight;
            pX = box.offsetLeft;
            pY = box.offsetTop;
            startX = e.clientX;
            startY = e.clientY;
            endX = startX;
            endY = startY;
            isX = false;
            isY = false;
            isMove = false;
            isLeft = false;
            isTop = false;

            if(target === points.topCenter || target === points.bottomCenter){
                isX = false;
                isY = true;
            }else if(target === points.midLeft || target === points.midRight){
                isX = true;
                isY = false;
            }else{
                isX = true;
                isY = true;
            }

            isMove = target === points.midCenter;
            isLeft = target === points.topLeft || target === points.midLeft || target === points.bottomLeft;
            isTop = target === points.topLeft || target === points.topCenter || target === points.topRight;

            utils.addEvent(document, 'mousemove', moveHandler);
            utils.addEvent(document, 'mouseup', upHandler);
        });
    }
}
export default ScaleControl;