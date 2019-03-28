layui.use(['table', 'layer'], function(){
    const table = layui.table
    const layer = layui.layer
    const $ = layui.$
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
    table.on("tool(demo)", (obj) => {
      const data = obj.data
      // 评论id
      const commentId = data._id
      // 文章id
      const articleId = data.article

      //console.log(data,articleId)
      if(obj.event !== "del") return

      layer.confirm("确认删除？", () => {
        $.ajax({
          method: "delete",
          url: "/comment/" + commentId,
          data: {
            // 发送文章id值，减少后台查询
            articleId
          },
          success(res){
            if(res.state){
              layer.msg(res.message, {
                anim: 1,
                time: 800
              }, () => location.reload())
            }else{
              console.error(res.message)
            }
          }
        })
      })
    })
})