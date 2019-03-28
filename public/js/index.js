// layui组件的加载
layui.use(["element"], () => {
  let element = layui.element
  const $ = layui.$

})
window.onload = () => {
  let $ = layui.$;
  //请求的封装
  function getData(url, method, data) {
    let $ = layui.$;
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
          let cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
            }
          }
        }
        return cookieValue;
    }

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    // Setting the token on the AJAX request
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
              //console.log( getCookie('csrf'))
              xhr.setRequestHeader("X-Csrf-Token", getCookie('csrf'));
              // xhr.setRequestHeader("X-Xsrf-Token", getCookie('csrf'));
            }
        }
    });
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
  // 渲染 用户状态
  function renderUser(data) {
    let userList = $("#slide ul"),
        userAvatar = $(".blog-header .user"),
        publish = document.querySelector(".blog-panel .publish"),
        str = "";
    if (data == "{}") {
      publish.style.display = "none";
      str = `<li><a href="/user">我要登录</a></li>
      <li><a href="/user">我要注册</a></li>`;
    } else {
      data = JSON.parse(data);
      if(data.username === "admin" || data.username ==="dawang"){
        publish.style.display = "block";
      }
      //console.log(imgUpLoad)
      userAvatar.attr("href",`${data.role > 1 ? "/admin/user": "/admin/userface"}`);
      userAvatar.html(`<img class="avatar" src=${data.avatar} alt=${data.username} width="40" title="个人中心">
      <span class="small ellipsis">${data.username}</span>`);
      str = `<li>
            <a class="top" href=${
              data.role > 1 ? "/admin/user" : "/admin/userface"
            }> 个人中心</a>
            <a class="logout" href="javascript:;"> 退出登录</a>
          </li>
          <li>
            <img src=${data.avatar}>
            <span>${data.username}</span>
          </li>`;
    }
    userList.html(str);
    let oUserLogout = document.querySelector('#slide .logout'),
        oUsername = document.querySelector('#slide ul li span');
    if(oUserLogout){
      oUserLogout.onclick = function (e){
        e = e || window.event;
        (typeof e.preventDefault !== 'undefined') ? e.preventDefault() : e.returnValue = false;
        let username = oUsername.innerHTML;
        let pid;
        if(window.returnCitySN){
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
  }
  let tipsList = $('.blog-panel ul li');
  let index = 0;
  for(let i=0,len=tipsList.length;i<len;i++){
    tipsList[i].onclick = function (e) {
      e.preventDefault();
      //console.log($(this.children).attr("href"));
      $(this.children).addClass("selected");
      // console.log(tipsList[index].children);
      tipsList[index].children[0].className = "";
      index = i;
      pageObj.time = true;
      pageObj.tips = $(this.children).html();
      pageObj.type = '';
      getData(
        "/api/artlist/1",
        "POST",
        {
          limit:10,
          type:pageObj.type,
          tips:pageObj.tips
        }).then(data => renderArt(data));
      //console.log($(e.target).attr("href"));
      return false;
    };
  } 
  let typeList = $('#type-nav dd');
  for(let i=0,len=typeList.length;i<len;i++){
    typeList[i].onclick = function (e) {
      e.preventDefault();
      let hrefArr = $(this.children).attr("href").split("/");
      pageObj.time = true;
      pageObj.type = hrefArr[hrefArr.length-1];
      //console.log(pageObj.type);
      pageObj.tips = '';
      getData(
        "/api/artlist/1",
        "POST",
        {
          limit:10,
          type:pageObj.type,
          tips:pageObj.tips
        }).then(data => renderArt(data));
      return false;
    };
  } 
   
  //渲染 文章列表 
  window.pageObj = {time:true};
  function renderArt(data) {
      let articleList = $(".article-list");
      //渲染文章列表
      let str = "";
      data = JSON.parse(data)
      let artList = data.artList;
      //$("#laypage").attr("data-maxnum",JSON.parse(data).maxNum);
      artList.forEach((v, i) => {
        str += `<li>
                  <div class="list-face">
                    <img src=${v.imgSrc?v.imgSrc:v.author.avatar} alt=${v.author.username}>
                  </div>
                  <div class="list-text">
                    <h2>
                      <a class="layui-badge">${v.tips}</a>
                      <a class="articlt-title ellipsis" href=/article/${v._id} target="_blank">${v.title}</a>
                    </h2>
                    <div class="list-content">
                      ${v.des?v.des:v.content}
                    </div>
                    <div class="list-info">
                      <span>
                        <i class="layui-icon layui-icon-date" title="日期"></i> ${new Date(v.created).toLocaleDateString()}
                      </span>
                      <span>
                        <img src=${v.author.avatar} alt=${v.author.username}>
                        <a>${v.author.username}</a>
                      </span>
                      <span class="list-reply">
                        <i class="layui-icon layui-icon-reply-fill" title="评论"></i>${v.commentNum?v.commentNum:0}条评论
                      </span>
                      <span class="list-love">
                        <a href=/article/love/${v._id} title="点赞">
                          <i class="layui-icon layui-icon-praise"></i>
                          喜欢${v.loveNum?v.loveNum:0}
                        </a>
                      </span>
                    </div>
                    <p>
                      <a href=/article/${v._id} title="阅读">
                        阅读全文
                        <i class="layui-icon layui-icon-right" title="阅读"></i>
                      </a>
                    </p>
                  </div>
                </li>`;
      });
      articleList.html(str); 
      // layui组件的加载
      pageObj.time && layui.use(["element", "laypage"], () => {
        let element = layui.element
        let laypage = layui.laypage
        const $ = layui.$
        element.tabDelete('demo', 'xxx')
        laypage.render({
          elem: "laypage",
          count: data.maxNum,
          layout: ['count', 'prev', 'page', 'next', 'limit', 'skip'],
          groups: 3,
          curr: location.pathname.replace("/api/artlist/", ""),
          jump(obj, f){
            $("#laypage a").each((i, v) => {
              let pageValue = `/api/artlist/${$(v).data("page")}`
              // v.link = pageValue
              v.href = "#"+`${$(v).data("page")}`;
            });
            //console.log(location.hash);
            //console.log(obj,f);
            !pageObj.time && getData(
              "/api/artlist/"+obj.curr,
              "POST",
              {
                limit:obj.limit,
                type:pageObj.type,
                tips:pageObj.tips
              }).then(data => renderArt(data));
          }
        });
        window.pageObj.time = false;
      });
                           
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
              var cip = parseInt(Date.now()/1000/60/60/10);
              if(window.returnCitySN)cip = returnCitySN['cip'];
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
  }
  // 渲染 文章点赞数
  function renderArtLove(data,i){
    let loveList = document.querySelectorAll(".article-list li .list-text .list-info .list-love a");
    // console.log(data,typeof data);
    // console.log(i)
    // console.log(loveList[i].innerHTML)
    loveList[i].innerHTML = `<i class="layui-icon layui-icon-praise"></i>喜欢${data?data:0}`;
  }
  // 渲染 网站公告和博客简介
  function renderNotice(data) {
    let notice = $("#notice"),
        intro = $("#intro"),
        str = "",
        str1="";
    //console.log(data);
    if(data !== "{}"){
      data = JSON.parse(data);
      if(notice.length){
        str = data.notice ? data.notice : "本站采用Nodejs做为后台,pug模板+layUI框架渲染页面，现为测试阶段，一些功能在逐渐完善，源码存放在Github。";
        notice.html(str);
      }
      if(intro.length){
        str1 = data.intro ? data.intro : "这是一个绚丽的时代，而你我正是这多彩世界的终极体验官。欢迎来到大王博客：www.dawang.xin\
          ,专注于前端开发、关注用户体验、分享个人经验，与喜欢提高视觉交互体验的朋友交流学习,希望做出更好的博客，期待您的参与！";
        intro.html(`<p>${str1}
              <a
                class="underline"
                href="/about"
                target="_blank"
              >了解更多。。。
              </a>
            </p>`);
      }
    }  
  }
  // 渲染 最近更新
  function renderNew(data) {
    let newList = $(".right-new-list"),
        str = "";
    //console.log(data,newList);
    data = JSON.parse(data);
    data.forEach((v) => {
        str +=
            `<li>
              <a class="img" href=/article/${v._id}>
                <img src=${v.imgSrc?v.imgSrc:v.author.avatar} alt=${v.title}/>
              </a>
              <a class="title" href=/article/${v._id}>${v.title}</a>
              <span>${new Date(v.created).toLocaleDateString()}</span>
            </li>`;
    });
    newList.html(str);
  }
  // 渲染 热度排行
  function renderHot(data) {
    let hotList = $("#hot-list .right-hot-list"),
        oImg = $("#hot-list .rank-list"),
        str = "";
    //console.log(data,hotList);
    data = JSON.parse(data);
    let num = Math.floor(Math.random()*(data.length-0.5));
    //console.log(num,data[num]);
    oImg.html(`<a href=/article/${data[num]._id}>
                        <img src="/article/default/1.jpg" alt=${data[num].title}>
                        <span>${data[num].title}</span>
                      </a>`);
    data.forEach((v,i) => {
        str +=
            `<li class="ellipsis">
              <span>${i+1}</span>
              <a href=/article/${v._id}>${v.title}</a>
            </li>`;
    });
    hotList.html(str);
  }
  // 渲染 随机文章
  function renderRandom(data) {
    let randomList = $("#random-list .right-hot-list"),
        oImg = $("#random-list .rank-list"),
        str = "";
    //console.log(data,hotList);
    data = JSON.parse(data);
    let num = Math.floor(Math.random()*(data.length-0.5));
    //console.log(num,data[num]);
    oImg.html(`<a href=/article/${data[num]._id}>
                        <img src="/article/default/1.jpg" alt=${data[num].title}>
                        <span>${data[num].title}</span>
                      </a>`);
    data.forEach((v,i) => {
        str +=
            `<li class="ellipsis">
              <span>${i+1}</span>
              <a href=/article/${v._id}>${v.title}</a>
            </li>`;
    });
    randomList.html(str);
  }
  // 渲染 精彩评论
  function renderComment(data) {
    let commentList = $(".right-comment-list"),
        str = "";
    //console.log(data,newList);
    data = JSON.parse(data);
    data.forEach((v) => {
        str +=
            `<li>
              <img src=${v.from.avatar} alt=${v.from.username}>
              <span class="title ellipsis">${v.from.username}</span>
              <span class="con ellipsis">
                ${v.content}
              </span>
              <a class="ellipsis" href=${(v.type && v.type==="websites")?"/find":"/article/"+v.article._id}>
                评：${(v.type && v.type==="websites")?"站点留言":v.article.title}
              </a>
            </li>`;
    });
    commentList.html(str);
  }
  //渲染 站点信息
  function renderWeb(data) {
    let webList = $("#web-info ul"),
        str = "";
    //console.log(data,newList);
    data = JSON.parse(data);
    str = `<li><span>文章总数 ：&nbsp; </span><span>${data[0]}&nbsp;篇</span></li>
          <li><span>分类数目 ：&nbsp; </span><span>${data[1]}&nbsp;个</span></li>
          <li><span>评论总数 ：&nbsp; </span><span>${data[2]}&nbsp;条</span></li>
          <li><span>注册用户 ：&nbsp; </span><span>${data[3]}&nbsp;名</span></li>
          <li><span>标签总数 ：&nbsp; </span><span>${data[4]}&nbsp;个</span></li>
          <li><span>建站时长 ：&nbsp; </span><span>${data[5]}&nbsp;天</span></li>
          <li><span>访问总数 ：&nbsp; </span><span>${data[6]}&nbsp;次</span></li>
          <li><span>最近更新 ：&nbsp; </span><span>${data[7]}</span></li>`
    webList.html(str);
  }
  //渲染 标签云
  function renderTags(data) {
    let tagsList = $("#web-tags"),
        colorArr = ['#0f0','#0cf','#f90','#0c6','#fcc','#f3f','#06c','#63c','#f09','#903','#60f','#c06'],
        len = colorArr.length,
        str = "";
    //console.log(data,newList);
    data = JSON.parse(data);
    data.forEach((v,i) => {
      str += `<span style=background:${colorArr[Math.floor(Math.random()*(len-0.5))]}>${v}</span>`;
    })
    tagsList.html(str);
    let span = document.querySelectorAll("#web-tags span");
    for(let i=0,len=span.length;i<len;i++){
      span[i].style.backgroundColor = colorArr[Math.floor(Math.random()*(len-0.5))];
    }
  }

  //渲染 用户状态
  getData("/api/user/state").then(data => renderUser(data));
  //渲染 文章列表
  getData("/api/artlist/1").then(data => renderArt(data));
  //渲染 博客简介
  getData("/api/notice").then(data => renderNotice(data));
  //渲染 最近更新
  getData("/api/newlist").then(data => renderNew(data));
  //渲染 热度排行
  getData("/api/hotlist").then(data => renderHot(data));
  //渲染 随机文章
  getData("/api/randomlist").then(data => renderRandom(data));
  //渲染 精彩评论
  getData("/api/commentlist").then(data => renderComment(data));
  //渲染 站点信息
  getData("/api/weblist").then(data => renderWeb(data));
  //渲染 标签云
  getData("/api/tagslist").then(data => renderTags(data));
  
  
};
