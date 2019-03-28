const User = require('../Models/user');
const encrypt = require('../util/encrypt');
const fs = require('fs');
const client = require('../util/myredis');

// 注册 登录界面
exports.user = async ctx => {
    await new Promise((resolve, reject) => {
      fs.readFile("views/05.html", "utf8", (err, data) => {
          if (err) reject(err);
          resolve(data);
      });
    }).then((data) => {
        ctx.body = data;
    }, err => console.log(err));
}
// 用户注册
exports.reg = async ctx => {
  const user = ctx.request.body
  const username = user.username
  const password = user.password
  // 1、去数据库 user集合 先查询当前发过来的 username 是否存在
  await new Promise((resolve, reject) => {
    // 去 users 数据库查询
    User.find({username}, (err, data) => {
      if(err)return reject(err)
      // 数据库查询没出错？ 还有可能没有数据
      if(data.length !== 0){
        // 查询到数据 -->  用户名已经存在
        return resolve("")
      }
      // 用户名不存在  需要存到数据库
      // 保存到数据库之前需要先加密，encrypt模块是自定义加密模块
      const _user = new User({
        username,
        password: encrypt(password),
        commentNum: 0,
        articleNum: 0
      })
      
      _user.save((err, data) => {
        if(err){
          reject(err)
        }else{
          resolve(data)
        }
      })
    })
  })
  .then(async data => {
    if(data){
      // 注册成功
      ctx.body = {status:"注册成功!"};
      // await ctx.render("isOk", {
      //   status: "注册成功"
      // })
    }else{
      // 用户名已存在
      ctx.body = {status:"用户名已存在!"};
      // await ctx.render("isOk", {
      //   status: "用户名已存在"
      // })
    }
  })
  .catch(async err => {
    ctx.body = {status:"注册失败，请重试!"};
    // await ctx.render('isOk', {
    //   status: "注册失败，请重试"
    // })
  })
}
// 用户登录
exports.login = async ctx => {
  // 拿到 post 数据
  const user = ctx.request.body
  const username = user.username
  const password = user.password
  const userPid = user.pid
  //console.log("login",ctx.csrf,ctx.session.csrf);
  await new Promise((resolve, reject) => {
    client.get(username+userPid,async function (err,v) {
      if(err) console.log(err);
      if(v) {
        //console.log(1,v);
        resolve({status:"该用户已登录！"});
      }else{
        //console.log(cip);
        // await new Promise((resolve, reject) => {
        await User.find({username}, (err, data) => {
            if(err)return reject({status:"数据错误，登录失败！"})
            if(data.length === 0) return reject({status:"用户名不存在"})       
            // 把用户传过来的密码 加密后跟数据库的比对
            if(data[0].password === encrypt(password)){
              return resolve(data)
            }
            resolve("")
          })
        // })
        .then(data => data)
        .catch(async err => {
          console.log(err);
          reject({status:"数据错误，登录失败！"});
        })
      }
      // client.quit();    
    });
  })
  .then(async data => {
    if(data.status === "该用户已登录！"){
      //console.log(data);
      return ctx.body = {status:"该用户已登录！"};
    }
    if(!data){
      //console.log("密码不正确，登录失败！",data);
      return ctx.body = {status:"密码不正确，登录失败！"};
    }

    // 让用户在他的 cookie 里设置 username password 加密后的密码 权限
    ctx.cookies.set("username", username, {
      domain: "localhost",
      path: "/",
      maxAge: 36e5,
      httpOnly: true, // true 不让客户端能访问这个 cookie
      overwrite: false
    })
    // 用户在数据库的_id 值
    ctx.cookies.set("uid", data[0]._id, {
      domain: "localhost",
      path: "/",
      maxAge: 36e5,
      httpOnly: true, // true 不让客户端能访问这个 cookie
      overwrite: false
    })
    
    ctx.session = {
      username,
      uid: data[0]._id,
      avatar: data[0].avatar,
      role: data[0].role,
      isLogin:true
    }
    client.set(username+userPid,'true',function(err,v){
      console.log('set',err,v);
    });
    client.expire(username+userPid,60*60,function(err,v){
      console.log('expire',err,v);
    });
    //console.log("login",ctx.session)
    // 登录成功
    return ctx.body = {status:"登录成功!"};
  },data =>{
    //console.log("reject2",data);
    return ctx.body = data;
  })
  .catch(async err => {
    console.log(err);
    ctx.body = {status:"登录失败！"};
  });
  //console.log("userlogin");
}
// 修改密码
exports.change = async ctx => {
  // 拿到 post 数据
  const user = ctx.request.body;
  const username = user.username;
  const password = user.password;
  const newPassword = user.newPassword;
  if(!username) return ctx.body = {status:"请输入用户名！"}
  //console.log(user,username)
  if(username && !password){
    await new Promise((resolve, reject) => {
      User.find({username}, (err, data) => {
        if(err)return reject(err)
        if(data.length === 0) return reject("用户名不存在!")        
        resolve("用户名正确!")
      })
    })
    .then(async data => {
      ctx.body = {status:data};
    })
    .catch(async err => {
      ctx.body = {status:err};
    })
  }
  if(username && password && !newPassword){
    await new Promise((resolve, reject) => {
      User.find({username}, (err, data) => {
        if(err)return reject(err)
        if(data.length === 0) return reject("用户名不存在!")        
        //把用户传过来的密码 加密后跟数据库的比对
        if(data[0].password === encrypt(password)){
          return resolve(data)
        }
        resolve("")
      })
    })
    .then(async data => {
      if(data){
        ctx.body = {status:"密码正确!"};
      }else{
        ctx.body = {status:"密码不正确!"};
      }      
      //console.log("then",data)
    })
    .catch(async err => {
      ctx.body = {status:err};
      //console.log("err",err)
    })
  }
  if(username && password && newPassword){
    await new Promise((resolve, reject) => {
      User.find({username}, (err, data) => {
        if(err)return reject(err)
        if(data.length === 0) return reject("用户名不存在！")        
        //把用户传过来的密码 加密后跟数据库的比对
        if(data[0].password === encrypt(password)){
          return resolve(data)
        }
        resolve("")
      })
    })
    .then(async data => {
      if(data){
        if(newPassword === password) return ctx.body = {status:"新密码与旧密码一样！"}
        await User.updateOne({username:username}, {password: encrypt(newPassword)}, (err,data) => {
          if(err) return console.log(err);
          //console.log(data,"密码成功修改!，新密码为"+newPassword);
          ctx.body = {status:"密码成功修改!，新密码为"+newPassword};
        })
      }else{
        ctx.body = {status:"密码不正确!"};
      }      
      //console.log("then",data)
    })
    .catch(async err => {
      ctx.body = {status:err};
      //console.log("err",err)
    })
  }
}

// 确定用户的状态  保持用户的状态
exports.keepLog = async (ctx, next) => {
  //console.log("session",ctx.session,ctx.session.isLogin)
  if(ctx.session.isLogin){// session没有
    //console.log(ctx.cookies.get("username"));
    if(ctx.cookies.get("username")){
      let uid = ctx.cookies.get("uid");
      const user = await User.findById(uid)
        .then(data => data);
      ctx.session = {
        username: ctx.cookies.get('username'),
        uid,
        avatar:user.avatar,
        role:user.role,
        isLogin:true
      }
    }
  }
  //console.log("keeplogin-before",ctx.session.secret,ctx.csrf);
  let csrf = ctx.csrf;
  //console.log(csrf);
  //ctx.session.csrf = csrf;
  ctx.cookies.set("csrf", csrf, {
    domain: "localhost",
    path: "/",
    maxAge: 36e5,
    httpOnly: false,
    overwrite: false
  });
  //console.log("keeplogin-after",ctx.session.secret,ctx.csrf);
  await next()
}
exports.userState = async ctx => {
  let data = {};
  //console.log("userState",ctx.session);
  if(ctx.session.isLogin){// session没有
    if(ctx.cookies.get("username")){
      //console.log("userState",ctx.cookies);
      let uid = ctx.cookies.get("uid")
      const user = await User.findById(uid)
        .then(data => data)
      const role = user.role,
            avatar = user.avatar;
      data = {
          username: ctx.cookies.get('username'),
          uid,
          avatar,
          role,
          isLogin:true
        }
    }
  }    
  ctx.body = data;
}
// 用户退出中间件
exports.logout = async (ctx,next) => {
  const user = ctx.request.body
  const username = user.username
  const userPid = user.pid
  //console.log(username+userPid);
  // client.exists(username+userPid, function(err, reply) {
  //   if (reply === 1) {
  //       console.log('exists');
  //   } else {
  //       console.log('doesn\'t exist');
  //   }
  // });
  client.expire(username+userPid,1,function(err,v){
    console.log("expire",err,v);
  });
  client.del(username+userPid,function(err,v){
    console.log("del",err,v);
  });
  ctx.session = null
  ctx.cookies.set("username", null, {
    maxAge: 0
  })
  
  ctx.cookies.set("uid", null, {
    maxAge: 0
  })
  // 在后台做重定向到 根  
  ctx.body = {status:'用户退出'}
}

exports.getlogout = async ctx => {

  // 在后台做重定向到 根  
  await ctx.redirect("/")
}
// 用户的头像上传
exports.upload = async ctx => {
  const filename = ctx.req.file.filename

  let data = {}

  await User.updateOne({_id: ctx.session.uid}, {$set: {avatar: "/avatar/" + filename}}, (err, res) => {
    if(err){
      data = {
        status: 0,
        message: "上传失败"
      }
    }else{
      data = {
        status: 1,
        message: '上传成功'
      }
    }
  })
  ctx.body =  data
  if(ctx.cookies.get("username")){
    let uid = ctx.cookies.get("uid")
    const avatar = await User.findById(uid)
      .then(data => data.avatar)
    ctx.session = {
      username: ctx.cookies.get('username'),
      uid,
      avatar
    }
  }
}

// 删除用户
exports.del = async ctx => {
  const _id = ctx.params.id
  // 用户的所有文章删除
  // 用户所有的评论删除
  
  let res = {
    state: 1,
    message: "成功"
  }

  await User.findById(_id)
    .then(data => data.remove())
    .catch(err => {
      res = {
        state: 0,
        message: err
      }
    })
  ctx.body = res
}
// 更改用户权限
exports.changerole = async ctx => {
  const username = ctx.session.username
  let res = {
    state: 1,
    message: "更改成功"
  }
  if(username === "admin" || username === "dawang"){
    const _id = ctx.request.body._id
    //console.log(ctx.request.body)
    const role = ctx.request.body.role
    await User.updateOne({_id:_id}, {role:role}, (err,data) => {
      if(err){
        console.log(err);
        res = {
          state: 0,
          message: err
        }
      }
    })
  }else{
    res={
      state:0,
      message:"当前用户无更改权限！"
    }
  }
  ctx.body = res
}