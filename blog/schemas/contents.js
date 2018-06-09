let mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },

    title:String,

    addTime:{
        type:Date,
        default:new Date(),
        //time:console.log(new Date())
    },

    //点击量
    views:{
        type:Number,
        default:0
    },

    description:{
        type:String,
        default:''
    },

    content:{
        type:String,
        default:''
    },
    
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },

    comments:{
        type:Array,
        default:[]
    }
});
//console.log(new Date());