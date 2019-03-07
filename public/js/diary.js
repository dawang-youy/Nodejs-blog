layui.use(["element", "laypage"], () => {
  let element = layui.element
  let laypage = layui.laypage
  const $ = layui.$
  element.tabDelete('demo', 'xxx')
  laypage.render({
    elem: "laypage",
    count: $("#laypage").data("maxnum"),
    limit: 10,
    groups: 3,
    curr: location.pathname.replace("/diary/page/", ""),
    jump(obj, f){
      $("#laypage a").each((i, v) => {
        let pageValue = `/diary/page/${$(v).data("page")}`
        v.href = pageValue
      })
    }
  })
})