layui.use(["element", "laypage"], () => {
    let element = layui.element
    let laypage = layui.laypage
    const $ = layui.$
    element.tabDelete('demo', 'xxx')
    laypage.render({
      elem: "laypage",
      count: $("#laypage").data("maxnum"),
      limit: 10,
      groups: 3,
      curr: location.pathname.replace("/search/", ""),
      jump(obj, f){
        $("#laypage a").each((i, v) => {
          let pageValue = `/search/${$(v).data("page")}?searchinput=${$("#laypage").data("option")}`
          v.href = pageValue
        })
      }
    })
});
window.onload = function(){
    let $ = layui.$;
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
    let oLoveClick = document.querySelectorAll(".article-list li .list-text .list-info .list-love a");
    //console.log(oLoveClick[0]);
    if(oLoveClick){
        for(let i=0,len=oLoveClick.length;i<len;i++){
            oLoveClick[i].onclick = function loveCount(e,index){ 
            if (e) {
                e.preventDefault();
            } else {
                window.event.returnValue = false;
            }
            var cip = returnCitySN['cip'];
            //console.log(cip,typeof cip);
            var href = this.getAttribute("href");
            href = href.substring(14);
            //console.log(href);
            var data = {
                cip:cip,
                href:href
            }
            //data = JSON.stringify(data);                          
            // getData("/article/love","POST",data).then(data => {   
            //   console.log(data);                         
            // });
            let isClick;
            //console.log(document.cookie,cookieArr)
            if (document.cookie){
                var cookieArr = document.cookie.split(";");
                for (let i = 0, len = cookieArr.length; i < len; i++) {
                //console.log(cookieArr[i].split("=")[0].trim());
                //console.log("loveClick"+href)
                if ("loveClick" + href === cookieArr[i].split("=")[0].trim()) {
                    isClick = true;
                    //console.log(isClick);
                    break;
                }
                }
            }
            //console.log(document.cookie,cookieArr)
            //console.log(isClick)
            if (isClick) {
                alert("宝宝，你已经点过赞了欧！");
            } else {
                //e.target.setAttribute("disabled",false);
                //this.setAttribute("class","");
                setCookie("loveClick" + href, true);
                index = i;
                getData("/article/love", "POST", data).then(str => {
                getData("/article/love", "POST", data).then(data =>
                renderArtLove(data,index)
                );});
            }
            };
        }
    };
    function setCookie(name, value, liveMinutes) {  
        if (liveMinutes == undefined || liveMinutes == null) {
            liveMinutes = 60 * 2;
        }
        if (typeof (liveMinutes) != 'number') {
            liveMinutes = 60 * 2;//默认120分钟
        }
        var minutes = liveMinutes * 60 * 1000;
        var exp = new Date();
        exp.setTime(exp.getTime() + minutes + 8 * 3600 * 1000);
        //path=/表示全站有效，而不是当前页
        document.cookie = name + "=" + value + ";path=/;expires=" + exp.toUTCString();               
    }
    // 渲染 文章点赞数
    function renderArtLove(data,i){
        let loveList = document.querySelectorAll(".article-list li .list-text .list-info .list-love a");
        // console.log(data,typeof data);
        // console.log(i)
        // console.log(loveList[i].innerHTML)
        loveList[i].innerHTML = `<i class="layui-icon layui-icon-praise"></i>喜欢${data?data:0}`;
    }
}