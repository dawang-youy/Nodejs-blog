layui.use(['element', "layer"], function(){
  const element = layui.element;
  const layer = layui.layer
  const $ = layui.$

  let $password = $("#reg input[name=password]");
  let $password2 = $("#reg input[name=confirmPWD]");
  let password = $("#change input[name=newPassword]");
  let password2 = $("#change input[name=confirmPWD]");
  let username = $("#change input[name=username]");
  let oldPassword = $("#change input[name=oldPassword]")
  $password2.on("blur", function(){
    const pwd = $password.val()
    if($(this).val() !== pwd){
      layer.msg("两次密码不一致")
      $(this).val("")
    }
  })
  username.on("blur", function(){
    let userName = username.val().trim();
    if(userName === ""){
      layer.msg("名字不能为空!");
    }
    $.post("/user/change",{userName},function(data){
      layer.msg(data.status);
    },'json')
  })
  oldPassword.on("blur", function(){
    let userName = username.val().trim();
    let passWord = oldPassword.val().trim();
    if(password === ""){
      layer.msg("密码不能为空!");
    }
    $.post("/user/change",{userName,passWord},function(data){
      layer.msg(data.status);
    },'json')
  })
  password2.on("blur", function(){
    const pwd = password.val()
    if($(this).val() !== pwd){
      layer.msg("两次密码不一致")
      $(this).val("")
    }
  })
});
window.onload = function (){
  let $ = layui.$;
  //渲染 用户状态
  getData("/api/user/state").then(data => renderUser(data));
  let loginBtn = $("#login form button");
  let regBtn = $("#reg form button");
  let changeBtn = $("#change form button");
  //console.log(button)
  // get cookie using jQuery
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
        //xhr.setRequestHeader("X-Xsrf-Token", getCookie('csrf'));
      }
    }
  });
  loginBtn[0].onclick = function (e){
    e = e || window.event;
    (typeof e.preventDefault !== 'undefined') ? e.preventDefault() : e.returnValue = false;
    let username = $("#login input[name=username]").val().trim();
    let password = $("#login input[name=password]").val().trim();
    let pid;
    //let returnCitySN = returnCitySN || new Date();
    if(window.returnCitySN){
      pid = returnCitySN['cip'];
    }else{
      pid = username;
    }
    let data = {username,password,pid};
    //console.log(returnCitySN['cip']);
    //console.log(pid);
    if(username && password){
      getData("/user/login","POST",data).then(data => renderState(data));
    }else{
      alert("字段不能为空！")
    }
  }
  regBtn[0].onclick = function (e){
    e = e || window.event;
    (typeof e.preventDefault !== 'undefined') ? e.preventDefault() : e.returnValue = false;
    let username = $("#reg input[name=username]").val().trim();
    let password = $("#reg input[name=password]").val().trim();
    let data = {username,password};
    //console.log(data)
    if(username && password){
      getData("/user/reg","POST",data).then(data => renderState(data));
    }else{
      alert("字段不能为空！")
    }
  }
  changeBtn[0].onclick = function (e){
    e = e || window.event;
    (typeof e.preventDefault !== 'undefined') ? e.preventDefault() : e.returnValue = false;
    let userName = $("#change input[name=username]").val().trim();
    let passWord = $("#change input[name=oldPassword]").val().trim();
    let newPassword = $("#change input[name=newPassword]").val().trim();
    let confirmPassword = $("#change input[name=confirmPWD]").val().trim();
    let data = {username:userName,password:passWord,newPassword:newPassword};
    //console.log(data)
    if(userName && passWord && newPassword && confirmPassword){
      getData("/user/change","POST",data).then(data => renderState(data));
    }else{
      alert("字段不能为空！")
    }
  }
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
  // 渲染 提交后的状态
  function renderState(data) {
    let userFrame = $("#content .user-frame"),
        str = "";
    data = JSON.parse(data);
    //console.log(data);
    if(data.status !== ""){
      str = `<h2>${data.status}</h2>
            <h3>即将跳转</h3>`;
      if(data.status === "用户名不存在" || data.status === "密码不正确，登录失败！" || data.status === "登录失败！"){
        console.log(data.status);
        setTimeout(() => {
          window.location.href = "/user";
        }, 2000)
      }else{
        setTimeout(() => {
          window.location.href = "/article";
        }, 2000)
      }
    }else{
      let key = Object.keys(data.message);
      //console.log(key);
      let message = "";
      key.forEach(item =>{
        if(item == "username"){
          message += "用户名必须是5到12位字符!"+"<br>"
        }else if(item == "password"){
          message += "密码必须是5到12位字符!"+"<br>"
        }else if(item == "newPassword"){
          message += "新密码必须是5到12位字符!"+"<br>"
        }
      })
      str = `<h2>${message}</h2>
      <h3>即将跳转</h3>`;
      setTimeout(() => {
        window.location.href = "/user";
      }, 2000)
    }
    userFrame.html(str);   
  }
}