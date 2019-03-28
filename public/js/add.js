layui.use(['form', 'layedit', "element"], function() {
    const form = layui.form;
    const layedit = layui.layedit;
    const $ = layui.$
    layedit.set({
      uploadImage: {
        url: '/upload/images' //接口url
        ,type: 'post' //默认post
      }
    });

    const index = layedit.build('article-content'); //建立编辑器
    
    form.on("submit(send)", (res) => {
      const { type,tips, title,des,url } = res.field;
      let tags = [];
      $("input[name='tags']:checked").each(function(){
        tags.push($(this).val())
      });
      //- console.log(res);
      //- console.log(res.field);
      //- console.log(tags);
      if(layedit.getText(index).trim().length === 0)return layer.alert("请输入内容");
      
      const data = {
        type,
        tips,
        tags,
        title,
        des,
        url,
        content: layedit.getContent(index)
      }
      //console.log(data)
      $.post("/article/add", data, (msg) => {
        if(msg.status){
          layer.alert('发表成功', (res) => {
            location.href = "/article"
          })
        }else{
          layer.alert(`发表失败，失败信息：${msg.msg}`)
        }
      })
    })
});
window.onload = function (){
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
            console.log( getCookie('csrf'))
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
  getData("/api/user/state").then(data => renderUser(data));
  // 渲染 用户状态
  function renderUser(data) {
    let userList = $("#slide ul"),
        userAvatar = $(".blog-header .user"),
        str = "";
    if (data == "{}") {
      str = `<li><a href="/user">我要登录</a></li>
      <li><a href="/user">我要注册</a></li>`;
    } else {
      data = JSON.parse(data);
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
  function renderWebOutline(data){
    let typeSelector = document.querySelector('select[name="type"]');
    let tipsSelector = $('select[name="tips"]');
    let tagsSelector = $('#tags');
    console.log(typeSelector,tipsSelector,tagsSelector);
    // data = JSON.parse(data);
    //console.log(data);
    data = "{}";
    if(data == "{}"){
      typeSelector.innerHTML += `
        <option></option>
        <option value="webFront">webFront</option>
        <option value="webBack">webBack</option>
        <option value="tools">tools</option>
        <option value="diary">diary</option>
        <option value="web">web</option>
        <option value="python">python</option>
        <option value="works">works</option>
      `;
      //console.log(typeSelector.innerHTML)    
    }else{
      data = JSON.parse(data);
      console.log(data)
      let tipsStr = '<option></option>',tagsStr = '',typesStr = '<option></option>';
      data.tipsList.forEach(item => {
        tipsStr += `
        <option value=${item}>${item}</option>`
      });
      tipsSelector.html(tipsStr);
      data.typesList.forEach(item => {
        typesStr += `
        <option value=${item}>${item}</option>`
      });
      typeSelector.html(typesStr);
      data.tagsList.forEach(item => {
        tagsStr += `
        <input type="checkbox" name="tags" value=${item} title=${item}>`
      });
      tagsSelector.html(tagsStr);
    }

  }
  //getData("/api/weboutline").then(data => renderWebOutline(data));
}