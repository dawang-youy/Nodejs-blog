~function(){
    console.log(returnCitySN['cip'] + returnCitySN['cname']);
    console.log( "\n %c 青丝梦思维个人博客 %c  © dawang  http://www.dawang.xin \n\n",
                    "color:#FFFFFB;background:#1abc9c;padding:5px 0;border-radius:.5rem 0 0 .5rem;",
                    "color:#FFFFFB;background:#080808;padding:5px 0;border-radius:0 .5rem .5rem 0;"
                    );
    
    var oSlide = document.getElementById('slide'),
        oFind = document.querySelector('#slide .find'),
        oBtn = document.getElementById('btnfold'),
        oSpan = document.querySelector('#btnfold span'),
        oSearch = document.querySelector('#search-box'),
        oClose = document.querySelector('#search-box .searchclose'),
        oTimeFrame = document.querySelector('.time-frame'),
        oSearchIpt = document.querySelector('#searchform .inputtext'),
        oSearchSub = document.querySelector('#searchform .iptsubmit'),
        oUserLogout = document.querySelector('#slide .logout'),
        oUsername = document.querySelector('#slide ul li span'),
        sBool = true,
        fBool = true,
        colorArr = ['#0f0','#0cf','#f90','#0c6','#fcc','#f3f','#06c','#63c','#f09','#903','#60f','#c06'];
    //console.log(oUserLogout);
    //请求的封装
    function getData(url, method, data) {
        let $ = layui.$;
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
    if(oUserLogout){
        oUserLogout.onclick = function (e){
            e = e || window.event;
            (typeof e.preventDefault !== 'undefined') ? e.preventDefault() : e.returnValue = false;
            let username = oUsername.innerHTML;
            let pid;
            if(returnCitySN){
              pid = returnCitySN['cip'];
            }else{
              pid = username;
            }
            let data = {username,pid};
            //console.log(data);
            getData("/user/logout","POST",data).then(data => {
                //console.log(history);
                window.location.reload();
            });
        }
    }   
    oSearchSub.onclick = function (e){
        e = e || window.event;
        e.preventDefault();
        var val = oSearchIpt.value;
        if(val){
            val = val.trim();
            //console.log('click',val)
            window.open("/search/1?searchinput="+val);
            // window.location.href = "/search/1?searchinput="+val
        }else{
            alert("关键字不能为空！");
        }
    }
    //oSearchIpt.onfocus = function(e){
        //e = e || window.event;      
    oSearchIpt.onkeydown = function(e){
        //e.stopPropagation();
        if(e.keyCode === 13){
            e.preventDefault();
            var val = oSearchIpt.value;
            if(val){
                val = val.trim();
                //console.log(val);
                window.open("/search/1?searchinput="+val);
                // window.location.href = "/search/1?searchinput="+val
            }else{
                alert("关键字不能为空！");
            } 
        }
    }
    //}
    // 鼠标左击特效
    document.onclick = function(e){
        e = e || window.event;
        var color = colorArr[Math.floor(Math.random() * 11)],
            oLeft = document.createElement('div'),
            oRight = document.createElement('div'),
            oH = document.createElement('div'),
            sDiv = document.createDocumentFragment();
        sDiv.appendChild(oLeft);      
        sDiv.appendChild(oRight);   
        oH.appendChild(sDiv);   
        document.body.appendChild(oH);
        oLeft.className = 'left';
        oLeft.style.backgroundColor = color;
        oRight.className = 'right';
        oRight.style.backgroundColor = color; 
        oH.className = 'heart';
        oH.style.left = e.clientX - 10 +"px";
        oH.style.top = e.clientY - 10 +"px";
        animate(oH,e.clientY-40);
        var num = 100;
        function animate(ele,target) {
            clearInterval(ele.timer);
            ele.timer = setInterval(function () {
                var step = (target-ele.offsetTop)/10;
                step = step>0?Math.ceil(step):Math.floor(step);
                num -= 3;
                ele.style.top = ele.offsetTop + step + "px";
                ele.style.opacity = (num/100).toFixed(1);
                if(Math.abs(target-ele.offsetTop)<Math.abs(step)){
                    ele.style.top = target + "px";
                    ele.style.opacity = 0.1;
                    clearInterval(ele.timer);
                    document.body.removeChild(oH);
                }
            },25);
        }
    }
    // 自定义鼠标右键
    document.oncontextmenu = function (e){
        e = e || window.event;
        if(e.button === 2){
            e.preventDefault();
            var oText = document.createElement('span');
            oText.className = "heart";
            oText.innerHTML = "宝宝，你想看啥？";
            document.body.appendChild(oText);
            oText.style.left = e.clientX + "px";
            oText.style.top = e.clientY + "px";
            animate(oText,0.3);
            var num = 100;
            function animate(ele,target) {
                clearInterval(ele.timer);
                ele.timer = setInterval(function () {
                    num -= 2;
                    ele.style.opacity = (num/100).toFixed(1);
                    if((num/100 - target) <= 0){
                        ele.style.opacity = target;
                        clearInterval(ele.timer);
                        document.body.removeChild(oText);
                    }
                },25);
            }
        }
    }
    // 右下置顶块
    var oTop = document.getElementById('top-box');
    window.onscroll = function (){
        // console.log(window.scrollTop);
        if(document.documentElement.scrollTop >= 400){
            oTop.style.display = "block";
            oTop.style.opacity = 1;
        }else{
            oTop.style.display = "none";
            oTop.style.opacity = 0;
        }      
        oTop.onclick = function (){
            var timer = null;
            clearInterval(timer);
            timer = setInterval(function () {
                var top = document.documentElement.scrollTop,
                    step = (0-top)/10;
                step = step>0?Math.ceil(step):Math.floor(step);
                window.scrollTo(0,top += step);
                if(window.scrollY <= 0){
                    clearInterval(timer);
                }
            },25);
        }
    }
    // 左上导航滑块
    function slide(){
        oSpan.style.transform = "rotate(180deg)";
        oSlide.style.left = "0px";
        setTimeout(function(){
            oSpan.style.transform = "rotate(360deg)";
            oSlide.style.left = "-219px";
        },2000);
    }
    slide();
    oBtn.onclick = function (){
        if(sBool){
            oSpan.style.transform = "rotate(180deg)";
            oSlide.style.left = "0px";
        }else{
            oSpan.style.transform = "rotate(360deg)";
            oSlide.style.left = "-219px";
        }
        sBool = !sBool;
    }
    oFind.onclick = function(){
        if(fBool){
            oSearch.style.height = "100px";
        }else{
            oSearch.style.height = "0";
        }
        fBool = !fBool;
    }
    oClose.onclick = function(){
        if(!fBool){
            oSearch.style.height = "0";
        }
        fBool = true;
    }
    function timeFrame(){
        var timeArr = ['早上好！','上午好！','中午好！','下午好！','晚上好！'],
            colorArr = ['#4cd964','#5ac8fa','#007aff','#5856d6','#ff2d55'],
            nowNum = new Date().getHours();
        if(nowNum >= 0 && nowNum < 8) {
            oTimeFrame.innerHTML = timeArr[0];
            oTimeFrame.style.color = colorArr[0];
        } 
        if(nowNum >= 8 && nowNum < 11) {
            oTimeFrame.innerHTML = timeArr[1];
            oTimeFrame.style.color = colorArr[1];
        } 
        if(nowNum >= 11 && nowNum < 14){
            oTimeFrame.innerHTML = timeArr[2];
            oTimeFrame.style.color = colorArr[2];
        }
        if(nowNum >= 14 && nowNum < 18) {
            oTimeFrame.innerHTML = timeArr[3];
            oTimeFrame.style.color = colorArr[3];
        } 
        if(nowNum >= 18 && nowNum < 24) {
            oTimeFrame.innerHTML = timeArr[4];
            oTimeFrame.style.color = colorArr[4];
        }
    }
    timeFrame()
    layui.use('laydate', function(){
        var laydate = layui.laydate;
        //直接嵌套显示
        laydate.render({
            elem: '#test-n1'
            ,position: 'static'
        });
    });
}()
