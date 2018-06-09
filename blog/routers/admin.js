
let express = require('express');
let router = express.Router();
let User = require('../models/User')
let Category = require('../models/Category');
let Content = require('../models/Content');

router.use(function(req,res,next){
    if(!req.userInfo.isAdmin){
        res.send('对不起，只有管理员才可以进入该页面');
        return;
    }
    next();
});

router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo : req.userInfo
    });
});

//用户管理

router.get('/user',function(req,res,next){

    //从数据库中读取记录
    //limit(Number):限制获取的条数
    //sikp():忽略前几条数据
    //User.count().then(function(count))//获取总条数
    let page = Number(req.query.page || 1);
    //console.log(req.query.page);
    let limit = 5;
    let pages = 0;

    User.count().then(function(count){
        //计算总页数
        //console.log(Math.ceil(count/limit));
        pages = Math.ceil(count/limit);//向上取整 
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        let skip = (page - 1)*limit;
        //console.log(page);
        User.find().limit(limit).skip(skip).then(function(users){
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                page:page,
                count:count,
                limit:limit,
                pages:pages
            });
        });  

    });
});

//分类首页

router.get('/category',function(req,res,next){
    let page = Number(req.query.page || 1);
    //console.log(req.query.page);
    let limit = 5;
    let pages = 0;

    Category.count().then(function(count){
        //计算总页数
        //console.log(Math.ceil(count/limit));
        pages = Math.ceil(count/limit);//向上取整 
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        let skip = (page - 1)*limit;
        //console.log(page);
        //1 升序
        //-1 降序
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories:categories,
                page:page,
                count:count,
                limit:limit,
                pages:pages
            });
        });  

    });
});

//添加分类

router.get('/category/add',function(req,res,next){
    res.render('admin/category_add',{
        userInfo:req.userInfo
    })
});

//保存分类

router.post('/category/add',function(req,res,next){
    let name = req.body.name;

    if(name == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'名称不能为空',
            url:''
        });
        return;
    }

    //查询数据库中书否存在同名的分类

    Category.findOne({
        name:name
    }).then(function(rs){
        if(rs){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'已经存在该分类'
            })
            return Promise.reject();
        }else{
            return new Category({
                name:name
            }).save();
        }
    }).then(function(newCategory){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'保存成功',
            url:'/admin/category/add'
        })
    })
});

//分类修改

router.get('/category/edit',function(req,res){
    //获取要修改的分类的信息，用表单形式展现出来
    let id = req.query.id || '';
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        } else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            })
            //console.log(category);
        }
    })
});

//修改保存

router.post('/category/edit',function(req,res){
    let name = req.body.name || '';
    let id = req.query.id || '';

    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/success',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        } else {
            //是否有修改
            if(name == category.name){
                res.render('/admin/error',{
                    userInfo:req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            } else {
                //修改的名称是否已经存在
                return Category.findOne({
                    _id:{$ne: id},
                    name:name
                });
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'已存在同名分类'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            } , {
                name:name
            });
        }
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'修改成功',
            url:'/admin/category'
        });
    })
});
router.get('/category/delete',function(req,res){
    let id = req.query.id;

    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'不存在该分类'
            });
            return Promise.reject();
        } else {
            return Category.remove({
                _id:id
            });
        }
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/category'
        });
    })
});

//内容首页

router.get('/content',function(req,res){
    let page = Number(req.query.page || 1);
    //console.log(req.query.page);
    let limit = 5;
    let pages = 0;

    Content.count().then(function(count){
        //计算总页数
        //console.log(Math.ceil(count/limit));
        pages = Math.ceil(count/limit);//向上取整 
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        let skip = (page - 1)*limit;
        //console.log(page);
        //1 升序
        //-1 降序
        Content.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents){
            //console.log(contents)
            res.render('admin/content_index',{
                userInfo:req.userInfo,
                contents:contents,
                page:page,
                count:count,
                limit:limit,
                pages:pages
            });
        });  

    });
})

//内容添加
router.get('/content/add',function(req,res){
    Category.find().sort({_id:-1}).then(function(categories){
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            categories:categories
        });
    })
});

//内容保存

router.post('/content/add',function(req,res){
    if(req.body.category == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类标题不能为空'
        });
        return;
    }
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'标题不能为空'
        });
        return;
    }

    new Content({
        category:req.body.category,
        title:req.body.title,
        user:req.userInfo._id.toString(),
        description:req.body.description,
        content:req.body.content,
        addTime:new Date()
    }).save().then(function(rs){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'保存成功',
            url:'/admin/content'
        });
    })
});

//内容修改

router.get('/content/edit',function(req,res){
    let id = req.query.id || '';
    //let categories;
    Category.find().then(function(categories){
        Content.findOne({
            _id:id
        }).populate('category').then(function(content){
            if(!content){
                res.render('admin/error',{
                    userInfo:req.userInfo,
                    message:'该内容不存在'
                });
            }else{
                res.render('admin/content_edit',{
                    userInfo:req.userInfo,
                    content:content,
                    categories:categories
                });
            }
        });
    });
});

router.post('/content/edit',function(req,res){
    let id = req.query.id || '';

    if(req.body.category == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'分类标题不能为空'
        });
        return;
    }
    if(req.body.title == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'标题不能为空'
        });
        return;
    } 

    Content.update({
        _id:id
    },{
        category:req.body.category,
        title:req.body.title,
        description:req.body.description,
        content:req.body.content
    }).then(function(){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'保存成功',
            url:'/admin/content'
        });
    })
});

//内容删除

router.get('/content/delete',function(req,res){
    id = req.query.id;

    Content.findOne({
        _id:id
    }).then(function(content){
        if(!content){
            res.render('admin.error',{
                userInfo:req.userInfo,
                message:'不存在该条内容'
            });
            return Promise.reject();
        } else {
            Content.remove({
                _id:id
            }).then(function(){
                res.render('admin/success',{
                    userInfo:req.userInfo,
                    message:'删除成功',
                    url:'/admin/content'
                });
            });
        }
    });
});

module.exports = router;