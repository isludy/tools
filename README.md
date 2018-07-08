### tools : 保存常用的一些函数、组件等代码库

在我还是初级菜鸟的时候，一个页面，可能要引入jquery, bootstrap, share, swiper...一大堆css和js。然后，用到的只是很少很少一部分功能。当我到达中级菜鸟的时候，我开始用原生代替换这些乱七八糟的框架、库或插件。然后，就开始思考一个问题：能否做这么一个库，虽然保存很多常用的方法或组件，但可以通过webpack进行订制式打包，也就是通过某种规则写法，可以达到只打包项目中用到的方法或组件。

#### 使用方法

1. 前提

    -> webpack webpack-cli
    
2. 开始

    -> 1) git clone 或者直接下载zip包

    -> 2) tools目录 npm install
    
    -> 3) 6个可用命令
        
        npm run dev-e 表示开发模式，每个组件分别产出它们自己到它们目录下的dist
        
        npm run dev-c xxx 表示开发模式，只产出xxx（组件文件夹名，如Player）到它目录下的dist
        
        npm run dev-m 表示开发模式，合并所有的组件 到tools目录下的dist
        
        npm run build-e , npm run build-c xxx, npm run build-m 同理，只是使用了生产模式。

3. 文件说明

    -> 1) utils文件夹，这里可以放独立的函数库，注意，必须是独立的，函数里不能依赖其他模块的方法，可以依赖自身的方法，但必须将this声明为utils。
    
    -> 2) tools.pretreat.js 是此库的核心预处理程序，请不要对它改动，除非你非常了解自己在干嘛。
    
    -> 3) tools.config.js 这是tools的配置文件
    
        module.exports = {
            group: {                     // group 是你需要加入tools的组件/工具
                PageSlide: {             // key 名一定要与文件夹对应
                    name: 'PageSlide',   // name 是组件的挂载/输出的变量名，如：挂载到window上时，输出window.PageSlide
                    entry: 'main'        // entry 是主文件名，一定要在组件/工具文件夹的根目录，如: PageSlide/main
                },
                Player: {
                    name: 'Player',
                    entry: 'main'
                }
            },
            merge: {                     // 合并组件/工具配置
                name: 'Tools.min',       // name 合并输出的文件的名称，默认Tools.min，即输出Tools.min.js
                path: './dist'           // path 合并输出的目录，默认为tools下的dist
            },
            mount: 'window'              // mount 设定挂载对象名称，默认window，注意：必须是字符串。
        };                               // 挂载到window时，引入Tools.min.js到html，组件/工具会这样的形式:
                                         // window.PageSlide、window.Player...
                                         // 也可以挂载到自定义的一个变量中，如:window.Tools，但必须注意的是
                                         // 如果挂载的对像不存在，要在加载Tools.min.js前，做这样的定义： 
                                         //    window.Tools = {};
                                         // 结果将是:
                                         // window.Tools = {
                                         //    PageSlide: [object xxx]
                                         //    Player: [object xxx]
                                         //    ...
                                         // } 
4. 订制方法

    通过配置tools.config.js文件，就可以订制自己需要的组件或库。

#### 后续

组件会在不断的开发，但不会影响你的使用，因为它们是独立的。要使用更多时，可以随时下载。
