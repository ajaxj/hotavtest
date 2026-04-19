参考学习:

如何发布react到 cloudflare pages


https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/


我对应的github项目在：https://github.com/ajaxj/hotavtest.git 分支 react-pages-template

react pages 模板 官方建立命令：
$ pnpm create cloudflare@latest my-react-template --framework=react --platform=pages

cf里面配置选择pages和模板react(vite)然后再修改：
Production branch	react-pages-template	//分支
Build command	npm run build
Build directory	dist

注意在根目录（高级）里面添写　my-react-template，因为开发目录不在根目录