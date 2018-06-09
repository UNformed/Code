let express = require('express');
let router = express.Router();
let Category = require('../models/Category');
let Content = require('../models/Content');
let data;
let markdown = require( "markdown" ).markdown;

//处理通数据
router.use(function(req,res,next){
    data = {
        userInfo:req.userInfo,
        categories:[]
    }
    //console.log( markdown.toHTML( "Hello *World*!" ) );
    Category.find().then(function(categories){
        data.categories = categories;
        next();
    })
})


router.get('/',function(req,res,next){

    data.category = req.query.category || '';
    data.count = 0;
    data.page = Number(req.query.page || 1);
    data.limit = 2;
    data.pages = 0;

    let where = {};
    if(data.category){
        where.category = data.category;
    }
    //console.log(data.category);

    //console.log(req.userInfo);
    Content.where(where).count().then(function(count){
        data.count = count;

        data.pages = Math.ceil(data.count/data.limit);

        data.page = Math.min(data.page,data.pages);

        data.page = Math.max(data.page,1);

        let skip = (data.page - 1)*data.limit

        return Content.where(where).find().limit(data.limit).skip(skip).sort({
            addTime:-1
        }).populate(['category','user']);
    }).then(function(contents){
        data.contents = contents;
        res.render('main/index',data)
    })
});

router.get('/view',function(req,res){
    let contentId = req.query.contentid || '';

    Content.findOne({
        _id:contentId
    }).then(function(content){
        data.content = content;
        data.markdownContent = markdown.toHTML(content.content);
        content.views ++;
        content.save();
        //console.log(data);
        res.render('main/view',data);
    });
});
module.exports = router;