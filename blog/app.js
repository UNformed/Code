
/*应用程序入口文件*/
//加载express模块
let express = require('express');
//加载模板处理模块
let swig = require('swig');
//加载数据库模块
let mongoose = require('mongoose');
//加载body-parse,用来吃力post过来的数据
let bodyParse = require('body-parser');
//加载cookies模块
let Cookies = require('cookies');
//创建app英勇 => NodeJS Http.creatServer();
let app = express();
let User = require('./models/User');


//设置静态文件托管
//当用户访问的url以/public开始（第一个参数），那么直接返回对应第二个参数下的文件
//app.use(express.static(path.join(__dirname, 'public')));
//app.use('/public',express.static("public"));辣鸡
app.use(express.static('public'));


//配置模板
//定义当前应用所使用的模板引擎
//第一个参数表示模板引擎名称，同时也是模板文件后缀，第二个参数表示，用于解析处理模板内容方法
app.engine('html',swig.renderFile);
//设置模板文件存放目录，第一个参数必须是views,第二个参数是目录
app.set('views','./views');
//注册所使用的模板引擎，第一个参数必须是vie engi，第二个参数和模板引擎名称是一致的。
app.set('view engine','html');
//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});
//bodyParse设置,调用这个函数会在req对象上增加一个body属性
app.use(bodyParse.urlencoded({extended:true})); 

//设置cookie
app.use( function( req,res,next){
    req.cookies = new Cookies(req,res);
    //解析用户登陆信息
    //console.log(typeof req.cookies.get())
    req.userInfo = {};

    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e){
            next();
        }
    }else{
        next();
    }
    
});

//分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));


mongoose.connect('mongodb://localhost:27017/blog',function(err){
    if(err){
        console.log('连接失败');
    }else{
        console.log('连接成功');
        app.listen(8888);
        console.log("oK");
    }
});

//监听http请求


