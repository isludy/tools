class ScaleControl {
    constructor(el){
        this.el = el;
        ScaleControl.create();
    }
    static create(){
        let box = document.createElement('div'),
            els = {
            topLeft: box.cloneNode(),
            topCenter: box.cloneNode(),
            topRight: box.cloneNode(),
            midLeft: box.cloneNode(),
            midCenter: box.cloneNode(),
            midRight: box.cloneNode(),
            bottomLeft: box.cloneNode(),
            bottomMid: box.cloneNode(),
            bottomRight: box.cloneNode()
        },
            test = /[A-Z]/g;

        box.className = 'scale-control';

        for(let k in els){
            els[k].className = 'scale-control' + k.replace(test, function($0){
                return '-'+$0.toLowerCase();
            });
            box.appendChild(els[k]);
        }
        document.body.appendChild(box);
    }
    static bind(){

    }
}
export default ScaleControl;