//console.log(window.location.pathname.split("/")[2]);
layui.use(["layedit", "layer", "element"], function() {
  const $ = layui.$;
  const layedit = layui.layedit;
  const layer = layui.layer;
  const idx = layedit.build("comment-txt", {
    tool: ["face", "link"],
    height: 120
  }); //建立编辑器

  //$(".layui-unselect.layui-layedit-tool").hide()
  //console.dir(layedit);
  $(".comment button").click(async () => {
    //console.log(layedit.getContent(idx));
    let content = layedit.getContent(idx).trim();
    //console.log(content);
    if (content.length === 0) return layer.msg("评论内容不能为空");

    const data = {
      content,
      article: window.location.pathname.split("/")[2]
    };

    $.post("/comment", data, data => {
      layer.msg(data.msg, {
        time: 1000,
        end() {
          if (data.status === 1) {
            // 评论成功就重载页面
            window.location.reload();
            // $.get("/api/artcomment/" + location.pathname.split("/")[2],data =>{
            //   //console.log(data,typeof data);
            //   renderArtComment(data);
            // })
            // layedit.getContent(idx) = "";
            //console.log(layedit);
          }
        }
      });
    });
    // 渲染 对应评论
    function renderArtComment(data) {
      let commentList = $(".comment .comment-list"),
          commentNum = $("#comment-num .num"),
          str = "";
      //console.log(data,newList);
      //data = JSON.parse(data);
      commentNum.html(data.length);
      data.forEach(v => {
        str += `<li>
                <img src=${v.from.avatar} alt=${v.from.username}/>
                <div>
                  <p class="author">${v.from.username}</p>
                  <p class="time">${new Date(v.created).toLocaleDateString()}</p>
                </div>
                <div class="she-said">
                  ${v.content}
                </div>
              </li>`;
      });
      commentList.html(str);
    }
  });
});
window.onload = () => {
  let $ = layui.$;

  //请求的封装
  function getData(url, method, data) {
    return new Promise((res, rej) => {
      $.ajax({
        type: method || "GET",
        url: url,
        dataType: "text",
        data: data,
        success: data => {
          res(data);
        }
      });
    });
  }
  // 渲染 用户状态
  function renderUser(data) {
    let userList = $("#slide ul"),
        userAvatar = $(".blog-header .user"),
        publish = document.querySelector(".blog-panel .publish"),
        imgUpLoad = document.querySelector("#main-con .imgupload"),
        upLoadBtn = $("#uploadimg"),
        str = "";
    //console.log(imgUpLoad)
    upLoadBtn.attr("data-articleid",window.location.pathname.split("/")[2]);
    // console.log(data.length);
    if (data == "{}") {
      publish.style.display = "none";
      imgUpLoad.style.display = "none";
      str = `<li><a href="/user">我要登录</a></li>
      <li><a href="/user">我要注册</a></li>`;
    } else {
      data = JSON.parse(data);
      if(data.username === "admin" || data.username ==="dawang"){
        imgUpLoad.style.display = "block";
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
            <a class="hide" href="/user/logout"> 退出登录</a>
          </li>
          <li>
            <img src=${data.avatar}>
            <span>${data.username}</span>
          </li>`;
    }
    userList.html(str);
  }
  // 渲染 文章内容
  //console.log(location.pathname.split("/"))
  function renderArt(data) {
    let article = $(".content"),
      tagsStr = (str = "");
    data = JSON.parse(data);
    // console.log(data);
    let preStr =
      data.pre.length > 0
        ? `<a class="ellipsis" href=/article/${data.pre[0]}>${data.pre[1]}
    </a>`
        : `<span>前面没有了!</span>`;
    let nextStr =
      data.next.length > 0
        ? `<a class="ellipsis" href=/article/${data.next[0]}>${data.next[1]}
    </a>`
        : `<span>这已经是最后一篇!</span>`;
    if (data.article.tags) {
      data.article.tags.forEach(v => {
        tagsStr += `<span class="item">${v}</span>`;
      });
    }
    document.title = data.article.title;
    str = `<h2 class="art-title text-center">${data.article.title}</h2>
              <div class="other-info text-center">
                  <span>作者：</span>
                  <span>${data.article.author.username}</span>
                  <span>&nbsp;&nbsp;发表于：</span>
                  <span>${new Date(
                    data.article.created
                  ).toLocaleString()}</span>
                  <span>&nbsp;分类：</span>
                  <span>${data.article.tips}</span>
                  <i class="layui-icon layui-icon-read">&nbsp;</i>
                  <span>${data.article.readNum}次浏览</span>
              </div>
              <hr style="border-top:1px dotted #999;">
              <p class="end-line">介绍</p>
              <div class="article-detail" style="overflow:hidden;padding:10px;">
                ${data.article.content}
              </div>
              <p class="end-line">结语</p>
              <div class="bottom-info">
                  <div class="love">
                      <a href=/article/love/${data.article._id} title="点赞">
                          <i class="layui-icon layui-icon-praise"></i>
                          <span>这篇很赞!</span>
                          <span>(</span>
                          <span class="love-num">${
                            data.article.loveNum ? data.article.loveNum : 0
                          }</span>
                          <span>)</span>
                      </a>
                      <a href=${data.article.type === "works"?data.article.url||"javascript:;":"javascript:;"} 
                         class=${data.article.type === "works"?"":"hide"}
                         title="demo演示" target="_blank" >
                          <span>demo演示</span>
                      </a>
                  </div>
                  <div class="tags">
                      <span> <i class="layui-icon layui-icon-note"></i>tags：</span>
                      <p class="con">
                        ${tagsStr}
                      </p>
                  </div>
                  <p>上一篇 :${preStr}</p>
                  <p> 下一篇 :${nextStr}</p>
              </div>`;
    article.html(str);
    // 文章点赞
    let aLoveClick = document.querySelector(
      ".default-box .bottom-info .love a"
    );
    //console.log(aLoveClick);
    if (aLoveClick) {
      aLoveClick.onclick = loveCount;
    }
    function setCookie(name, value, liveMinutes) {
      if (liveMinutes == undefined || liveMinutes == null) {
        liveMinutes = 60 * 2;
      }
      if (typeof liveMinutes != "number") {
        liveMinutes = 60 * 2; //默认120分钟
      }
      var minutes = liveMinutes * 60 * 1000;
      var exp = new Date();
      exp.setTime(exp.getTime() + minutes + 8 * 3600 * 1000);
      //path=/表示全站有效，而不是当前页
      document.cookie =
        name + "=" + value + ";path=/;expires=" + exp.toUTCString();
    }
    function loveCount(e) {
      if (e) {
        e.preventDefault();
      } else {
        window.event.returnValue = false;
      }
      var cip = returnCitySN["cip"];
      //console.log(cip,typeof cip);
      var href = this.getAttribute("href");
      href = href.substring(14);
      //console.log(href);
      var data = {
        cip: cip,
        href: href
      };
      //data = JSON.stringify(data);
      // getData("/article/love", "POST", data).then(data => console.log(data));
      let isClick;
      //console.log(document.cookie,cookieArr)
      if (document.cookie) {
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
        getData("/article/love", "POST", data).then(str => {
          getData("/article/love", "POST", data).then(data =>
          renderArtLove(data)
        );});
        setCookie("loveClick" + href, true);
      }
    }
  }
  // 渲染 文章点赞数
  function renderArtLove(data) {
    let loveNum = document.querySelector(
      ".default-box .bottom-info .love a .love-num"
    );
    console.log(data,typeof data);
    loveNum.innerHTML = data ? data :0;
  }
  // 渲染 相关文章
  function renderRelate(data) {
    let relateList = $(".related-art ul"),
      str = "";
    //console.log(data,newList);
    data = JSON.parse(data);
    data.relateId.forEach((v, i) => {
      str += `<li>
              <a href=/article/${v}>${data.relateTitle[i]}</a>
            </li>`;
    });
    relateList.html(str);
  }
  // 渲染 对应评论
  function renderArtComment(data) {
    let commentList = $(".comment .comment-list"),
      commentNum = $("#comment-num .num"),
      str = "";
    //console.log(data,newList);
    data = JSON.parse(data);
    commentNum.html(data.length);
    data.forEach(v => {
      str += `<li>
              <img src=${v.from.avatar} alt=${v.from.username}/>
              <div>
                <p class="author">${v.from.username}</p>
                <p class="time">${new Date(v.created).toLocaleDateString()}</p>
              </div>
              <div class="she-said">
                ${v.content}
              </div>
            </li>`;
    });
    commentList.html(str);
  }
  // 渲染 最近更新
  function renderNew(data) {
    let newList = $(".right-new-list"),
      str = "";
    //console.log(data,newList);
    data = JSON.parse(data);
    data.forEach(v => {
      str += `<li>
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
    let num = Math.floor(Math.random() * (data.length - 0.5));
    //console.log(num,data[num]);
    oImg.html(`<a href=/article/${data[num]._id}>
                        <img src=${data[num].imgSrc?data[num].imgSrc:data[num].author.avatar} alt=${
                          data[num].title
                        }>
                        <span>${data[num].title}</span>
                      </a>`);
    data.forEach((v, i) => {
      str += `<li class="ellipsis">
              <span>${i + 1}</span>
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
    let num = Math.floor(Math.random() * (data.length - 0.5));
    //console.log(num,data[num]);
    oImg.html(`<a href=/article/${data[num]._id}>
                        <img src=${data[num].imgSrc?data[num].imgSrc:data[num].author.avatar} alt=${
                          data[num].title
                        }>
                        <span>${data[num].title}</span>
                      </a>`);
    data.forEach((v, i) => {
      str += `<li class="ellipsis">
              <span>${i + 1}</span>
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
    if (data.length > 0) {
      data.forEach(v => {
        str += `<li>
                <img src=${v.from.avatar} alt=${v.from.username}>
                <span class="title ellipsis">${v.from.username}</span>
                <span class="con ellipsis">
                  ${v.content}
                </span>
                <a class="ellipsis" href=${
                  v.type && v.type === "websites"
                    ? "/find"
                    : "/article/" + v.article._id
                }>
                  评：${
                    v.type && v.type === "websites"
                      ? "站点留言"
                      : v.article.title
                  }
                </a>
              </li>`;
      });
    }
    commentList.html(str);
  }
  //渲染 站点信息
  function renderWeb(data) {
    let webList = $("#web-info ul"),
      str = "";
    //console.log(data,newList);
    data = JSON.parse(data);
    str = `<li><span>文章总数 ：&nbsp; </span><span>${
      data[0]
    }&nbsp;篇</span></li>
          <li><span>分类数目 ：&nbsp; </span><span>${
            data[1]
          }&nbsp;个</span></li>
          <li><span>评论总数 ：&nbsp; </span><span>${
            data[2]
          }&nbsp;条</span></li>
          <li><span>注册用户 ：&nbsp; </span><span>${
            data[3]
          }&nbsp;名</span></li>
          <li><span>标签总数 ：&nbsp; </span><span>${
            data[4]
          }&nbsp;个</span></li>
          <li><span>建站时长 ：&nbsp; </span><span>${
            data[5]
          }&nbsp;天</span></li>
          <li><span>访问总数 ：&nbsp; </span><span>${
            data[6]
          }&nbsp;次</span></li>
          <li><span>最近更新 ：&nbsp; </span><span>${data[7]}</span></li>`;
    webList.html(str);
  }
  //渲染 标签云
  function renderTags(data) {
    let tagsList = $("#web-tags"),
      colorArr = [
        "#0f0",
        "#0cf",
        "#f90",
        "#0c6",
        "#fcc",
        "#f3f",
        "#06c",
        "#63c",
        "#f09",
        "#903",
        "#60f",
        "#c06"
      ],
      len = colorArr.length,
      str = "";
    //console.log(data,newList);
    data = JSON.parse(data);
    data.forEach((v, i) => {
      str += `<span style=background:${
        colorArr[Math.floor(Math.random() * (len - 0.5))]
      }>${v}</span>`;
    });
    tagsList.html(str);
  }

  //渲染 用户状态
  getData("/api/user/state").then(data => renderUser(data));
  // 渲染 文章内容
  getData("/api/article/" + location.pathname.split("/")[2]).then(data =>
    renderArt(data)
  );
  // 渲染 相关文章
  getData("/api/relateart/" + location.pathname.split("/")[2]).then(data =>
    renderRelate(data)
  );
  // 渲染 对应评论
  getData("/api/artcomment/" + location.pathname.split("/")[2]).then(data =>
    renderArtComment(data)
  );
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
  // layui组件的加载
  layui.use(["upload", "layer"], async () => {
    const $ = layui.$
    const upload = layui.upload
    const layer = layui.layer

    //设定文件大小限制
    //console.log('/upload/articleimg/'+$("#uploadimg").data("articleid"))
    upload.render({
      elem: '#uploadimg'
      ,url: '/upload/articleimg/'+$("#uploadimg").data("articleid")
      ,type:'post'
      ,size: 60 //限制文件大小，单位 KB
      ,before: function(obj){
        //预读本地文件示例，不支持ie8
        obj.preview(function(index, file, result){
          $('#demo2').append('<img src="'+ result +'" alt="'+ file.name +'" class="layui-upload-img">')
        });
      }
      ,done(res){
        layer.alert(res.message)
      }
    });
  });
};
