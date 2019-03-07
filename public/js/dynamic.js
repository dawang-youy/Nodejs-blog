window.onload = function (){
  layui.use('flow', function(){
      var flow = layui.flow;
      var $ = layui.$;
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
      flow.load({
          elem: '#LAY_demo2' //流加载容器
          ,isAuto: false
          ,isLazyimg: true
          ,done: function(page, next){ //加载下一页
              //console.log(page);
              var maxNum = $("#LAY_demo2").data("maxnum");
              let timelineList = [],userAvatar="";
              getData("/dynamic/page?v="+(page-1)).then(data=>{
                  data = JSON.parse(data);
                  timelineList = data.timeline;
                  userAvatar = data.userAvatar;
                  //console.log(timelineList,userAvatar);
              })
              //模拟插入
              let n = 5;
              let len = Math.ceil(maxNum/n);
              //console.log(page,len)
              setTimeout(function(){
                  var lis = [];
                  for(var i = 0; i < n; i++){
                      if(!timelineList[i]) break;
                      var src = userAvatar ? userAvatar : "/avatar/admin1545287031739.jpg";
                      lis.push(`
                              <div lay-src=/find/page?v=${page}></div>
                              <li class="layui-timeline-item">
                                <div class="avatar">
                                  <img src=${src} alt="admin" width="100%" height="100%">
                                </div>
                                <i class="layui-icon layui-timeline-axis">&#xe63f;</i>
                                <div class="layui-timeline-content layui-text">
                                  <h4 class="layui-timeline-title">${new Date(timelineList[i].created).toLocaleString()}</h4>
                                  <p> ${timelineList[i].notes} </p>
                                </div>
                              </li>`)
                  }
                  next(lis.join(''), page < len); //假设总页数为 6
              }, 500);
          }
      }); 
  });
} 