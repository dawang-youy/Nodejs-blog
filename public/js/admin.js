layui.use('element', function(){
    var element = layui.element;
    const $ = layui.$

    $(".layui-nav-item a").each((i, v) => {
      const a_href = $(v).prop('href')         
      if(a_href === location.href){
        $('li').eq(i).addClass("layui-this")
      }
    })
  });
  window.onload = function(){
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
    let oUserLogout = document.querySelector('.logout');
    oUserLogout.onclick = function (e){
      e = e || window.event;
      (typeof e.preventDefault !== 'undefined') ? e.preventDefault() : e.returnValue = false;
      let pid,
          username = this.getAttribute("data-username");
      if(window.returnCitySN){
        pid = returnCitySN['cip'];
      }else{
        pid = username;
      }
      let data = {pid,username};
      //console.log(data);
      getData("/user/logout","POST",data).then(data => {
        //console.log(history);
        window.location.href = "/";
      });
    }
  }