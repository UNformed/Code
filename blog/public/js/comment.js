

let prepage = 3;
let page = 1;
let pages = 0;
let comments = [];

$('#messageBtn').on('click',function(){
    $.ajax({
        type: 'post',
        url: '/api/comment/post',
        data: {
            contentid:$('#contentId').val(),
            content:$('#messageContent').val()
        },

        success:function(responseData){
            $('#messageContent').val('');
            comments = responseData.data.comments
            render();
        }
    });
});

$.ajax({
    type:'get',
    url:'/api/comment',
    data:{
        contentid:$('#contentId').val()
    },
    success:function(responseData){
        comments = responseData.data;
        render();
    }
});

$('.pager').delegate('a','click',function(){
    if($(this).parent().hasClass('previous')){
        page -- 
    }else{
        page ++;
    }
    render();
})

function render(){
    $('#messageCount').html(comments.length);
    let start = Math.max(0, (page-1) * prepage);
    let end = Math.min(start + prepage, comments.length);

    pages = Math.ceil(comments.length / prepage);
    let $lis = $('.pager li');
    if(pages > 0){
        $lis.eq(1).html(`${page}/${pages}`);
    }else{
        $lis.eq(1).html('');
    }

    if(page <= 1){
        page = 1;
        $lis.eq(0).html(`<span>没有上一页了</span>`);
    }else{
        $lis.eq(0).html(`<a href="javascript:;">上一页</a>`)
    }

    if(page >= pages){
        page = pages;
        $lis.eq(2).html(`<span>没有下一页了</span>`);
    }else{
        $lis.eq(2).html(`<a href="javascript:;">下一页</a>`);
    }

    let html = '';
    for(let i = start;i<end;i++){
        html += `<div class="messageBox">
        <p class="name clear"><span class="fl">${comments[i].username}</span><span class="fr">${comments[i].postTime}</span></p><p>${comments[i].content}</p>
    </div>`
    }
    //console.log(111);
    $('.messageList').html(html);
}