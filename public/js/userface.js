layui.use(["upload", "layer"], () => {
    const $ = layui.$
    const upload = layui.upload
    const layer = layui.layer
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
    //设定文件大小限制
    upload.render({
      elem: '#upload'
      ,url: '/upload'
      ,size: 60 //限制文件大小，单位 KB
      ,done(res){
        layer.alert(res.message)
      }
    });
  })
