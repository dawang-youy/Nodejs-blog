layui.use(['form', 'layedit', "element"], function() {
    const form = layui.form;
    const layedit = layui.layedit;
    const $ = layui.$
    layedit.set({
      uploadImage: {
        url: '/upload/banner/image' //接口url
        ,type: 'post' //默认post
      }
    });

    const index = layedit.build('article-content',{tool:['image']}); //建立编辑器
    
    form.on("submit(send)", (res) => {
      const { notice,gambit,banner,recomment } = res.field;
      console.log(res.field);
      let types=tips=tags = [];
      $("input[name='tags']:checked").each(function(){
        tags.push($(this).val())
      });
      $("input[name='tips']:checked").each(function(){
        tips.push($(this).val())
      });
      $("input[name='types']:checked").each(function(){
        types.push($(this).val())
      });
      //- console.log(res);
      //- console.log(tags);
      //if(layedit.getText(index).length === 0)return layer.alert("请输入内容");
      
      const data = {
        notice,
        gambit,
        banner,
        recomment,
        tips,
        tags,
        types
      }
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
      $.post("/admin/edit", data, (msg) => {
        if(msg.status){
          layer.alert('发表成功', (res) => {
            location.href = "/admin/edit"
          })
        }else{
          layer.alert(`发表失败，失败信息：${msg.msg}`)
        }
      });
    })
})