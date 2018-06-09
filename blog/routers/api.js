
let express = require('express');
let router = express.Router();
let User = require('../models/User');
let Content = require('../models/Content');
let responseData;


router.use( function(req,res,next){
    responseData = {
        code:0,
        message:''
    }
    next();
});

router.post('/user/register',function(req,res,next){
    let username = req.body.username;
    let password = req.body.password;
    let repassword = req.body.repassword;

    if(username == ""){
        responseData.code = 1;
        responseData.message = "用户名不能为空";
        res.json(responseData);
        return;
    }
    if(password == ""){
        responseData.code = 2;
        responseData.message = "密码不能为空";
        res.json(responseData);
        return;
    }
    if(password !== repassword){
        responseData.code = 3;
        responseData.message = "两次输入密码不一致";
        res.json(responseData);
        return;
    }
    //与数据库中的记录对比
    User.findOne({
        username: username
    }).then(function(userInfo){
        if(userInfo){
            responseData.code = 4;
            responseData.message = "用户已经被注册";
            res.json(responseData);
            return;
        }
        //保存数据到数据库中
        let user = new User({
            username:username,
            password:password
        });
        return user.save();
    }).then(function(newUserInfo){
         //console.log(newUserInfo);
         responseData.message = '注册成功';
         res.json(responseData);
    })
});

//登陆

router.post('/user/login',function(req,res,next){
    let username = req.body.username;
    let password = req.body.password;

    if(username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名或者密码为空'
        res.json(responseData);
        return;
    }
    //查询数据库
    
    User.findOne({
        username:username,
        password:password
    }).then(function(userInfo){
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或者密码错误';
            res.json(responseData);
            return;
        }
        //用户名密码正确
        responseData.message = '登陆成功';
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        }
        req.cookies.set('userInfo',JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username//将内容转换成字符串，保存在userInfo参数中
        }));//发送一个cookies给浏览器
        res.json(responseData);
        return;
    })
});

//退出
router.get('/user/logout', function(req,res,next){
    req.cookies.set('userInfo',null);
    responseData.message = '退出';
    res.json(responseData);
});
//发表评论
router.post('/comment/post',function(req,res){
    let contentId = req.body.contentid;

    let postData = {
        username:req.userInfo.username,
        postTime:new Date().toLocaleString(),
        content:req.body.content
    };

    Content.findOne({
        _id:contentId
    }).then(function(content){
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent){
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    })
});
//获取指定文章的所有评论
router.get('/comment',function(req,res){
    let contentId = req.query.contentid;

    Content.findOne({
        _id:contentId
    }).then(function(content){
        responseData.message = 'ojbk';
        responseData.data = content.comments;
        res.json(responseData);
    });
});
module.exports = router;