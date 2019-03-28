window.onload = function (){
    layui.use(['layedit', 'layer', 'element'], function(){
        const $ = layui.$;
        const layedit = layui.layedit;
        const layer = layui.layer;
        const idx = layedit.build('comment-txt', {
            tool: ['face','link'],
            height: 120
        }); //建立编辑器

        //$(".layui-unselect.layui-layedit-tool").hide()
        
        $(".comment button").click(async () => {
            //console.log(layedit.getContent(idx),idx)
            let content = layedit.getContent(idx) ? layedit.getContent(idx).trim() : layedit.getContent(idx);
            //let content = layedit.getContent(idx)
            console.log(content)
            if(!content)return layer.msg("评论内容不能为空")
            const commentdata = {
                content,
                type: "websites"
            }

            $.post("/website/comment", commentdata, (data) => {
                //console.log(data)
                layer.msg(data.msg, {
                    time: 1000,
                    end(){
                        if(data.status === 1){
                            // 评论成功就重载页面
                            window.location.reload()
                        }
                    }
                })
            })
        })
    });
    layui.use('flow', function(){
        var flow = layui.flow;
        var $ = layui.$;
        //请求的封装
        function getData(url, method, data) {
            return new Promise((res, rej) => {
                $.ajax({
                    type: method || "GET",
                    url: url,
                    dataType: "text",
                    data: data,
                    success: data => {res(data)}
                });
            });
        }
        //console.log(commentList)
        flow.load({
            elem: '#LAY_demo2' //流加载容器
            ,isAuto: true
            ,isLazyimg: true
            ,done: function(page, next){ //加载下一页
                //console.log(page);
                var maxNum = $("#LAY_demo2").data("maxnum");
                let commentList = [];
                getData("/find/page?v="+(page-1)).then(data=>{
                    data = JSON.parse(data);
                    commentList = data;
                    //console.log(commentList);
                })
                //模拟插入
                let n = 5;
                let len = Math.ceil(maxNum/n);
                //console.log(page,len)
                setTimeout(function(){
                    var lis = [];
                    for(var i = 0; i < n; i++){
                        if(!commentList[i]) break;
                        var src = commentList[i].from ? commentList[i].from.avatar : "/avatar/admin1545287031739.jpg";
                        var author = commentList[i].from ? commentList[i].from.username : "无名氏"
                        lis.push(`
                                <div lay-src=/find/page?v=${page}></div>
                                <li>
                                    <img src=${src}>
                                    <div>
                                        <p class="author">${author}</p>
                                        <p class="time"> ${new Date(commentList[i].created).toLocaleString()} </p>
                                    </div>
                                    <div class="she-said"> ${commentList[i].content} </div}
                                </li>`)
                    }
                    next(lis.join(''), page < len); //假设总页数为 6
                    //<img lay-src="//s17.mogucdn.com/p2/161011/upload_279h87jbc9l0hkl54djjjh42dc7i1_800x480.jpg?v='+ ( (page-1)*6 + i + 1 ) +'">
                }, 500);
            }
        }); 
    });
    var oWrap = document.getElementById("footprint");
     //var oImg = document.getElementById("img");
    var oColor = document.getElementById("color");
    var oLine = document.getElementById("lineW");
    var aLineWinth = oLine.getElementsByTagName("li");
    var canvas = document.getElementById("canvas");
    var clear = document.getElementsByTagName("button")[1];
    var renderColor = document.getElementsByTagName("button")[2];
    var produceBtn = document.getElementsByTagName("button")[3];
    var cxt = canvas.getContext("2d");
    var _x, _y, x, y,canvasLeft,canvasTop;
    //console.log(oImg.offsetHeight);
    canvasLeft = oWrap.offsetLeft + canvas.offsetLeft;
    canvasTop = oWrap.offsetTop + canvas.offsetTop;
    window.onresize = function(){
        canvasLeft = oWrap.offsetLeft + canvas.offsetLeft;
        canvasTop = oWrap.offsetTop + canvas.offsetTop;
        //- canvasTop = oImg.offsetHeight;
    }
    cxt.strokeStyle = "#000";
    cxt.lineWidth = 1;
    function render(){
        // 生成20个颜色li
        oColor.innerHTML = "";
        for (var i = 0; i < 20; i++) {
            oColor.innerHTML += "<li></li>";
        }
        oColor.innerHTML +="<span></span>";
        oColor.innerHTML +="<span class='span'>点击更换画布背景</span>";
        oColor.innerHTML +="<span>重置背景</span>";
        // 为每个li添加随机背景颜色
        var aLi = oColor.getElementsByTagName("li");
        for (var i = 0; i < aLi.length; i++) {
            aLi[i].style.background = color();
        }
        // 更换画布背景颜色
        var oSpan = oColor.getElementsByTagName("span")[0];
        var aSpan = oColor.getElementsByTagName("span")[1];
        var bSpan = oColor.getElementsByTagName("span")[2];
        var canvasColor = "#fff";
        aSpan.onclick = function(){
            canvas.style.backgroundColor = canvasColor;
        }
        bSpan.onclick = function(){
            canvas.style.backgroundColor = "#fff";
        }
        // 画笔颜色
        for (var i = 0; i < aLi.length; i++) {
            aLi[i].index = i;
            aLi[i].onclick = function() {
            cxt.strokeStyle = this.style.background;
            oSpan.style.backgroundColor = this.style.background;
            canvasColor = this.style.background;
            };
        }
        // 画笔宽度
        for (var i = 1; i < aLineWinth.length; i++) {
            aLineWinth[i].index = i;
            aLineWinth[i].onclick = function() {
            cxt.lineWidth = Number(this.innerHTML);
            };
        }
    }
    render();
    // 生成png图像
    function downloadCanvas() {
        // console.log( oC.toDataURL() )
        // console.log( oC.toDataURL('image/jpeg') )
        const link = document.createElement('a')
        link.download = 'canvas.png'
        link.href =  canvas.toDataURL()
        link.click()
    }
    produceBtn.onclick = downloadCanvas;
    // 画板
    canvas.onmousedown = function(ev) {
        ev = ev || window.event;
        (_x = ev.pageX), (_y = ev.pageY);
        // 路径开始
        cxt.beginPath();
        cxt.moveTo(_x - canvasLeft, _y - canvasTop);
        this.onmousemove = function(ev) {
            ev = ev || window.event;
            (x = ev.pageX), (y = ev.pageY);
            //console.log(ev.pageY,y);
            // 路径移动
            cxt.lineTo(x - canvasLeft, y - canvasTop);
            cxt.stroke();
        };
        // 路径结束
        // document.onmouseup = function() {
        //   this.onmousemove = null;
        // };
    };
    document.onmouseup = function() {
        canvas.onmousemove = null;
    };
    clear.onclick = function() {
        cxt.clearRect(0, 0, canvas.width, canvas.height);
    };
    renderColor.onclick = render;
    // 随机颜色
    function color() {
        var colors = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        "a",
        "b",
        "c",
        "d",
        "e",
        "f"
        ];
        var c = "";
        for (var i = 0; i < 6; i++) {
        var n = parseInt(Math.random() * 15);
        c += colors[n];
        }
        return "#" + c;
    }
}      