
如何发布vue 到 cloudflare pages vue pages 模板：
https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/

我对应的github项目在：https://github.com/ajaxj/hotavtest.git 分支 vue-pages-template

$ pnpm create cloudflare@latest my-vue-template --framework=vue --platform=pages

cf里面配置
Production branch vue-pages-template  //分支
Build command npm run build
Build directory dist

注意在根目录（高级）里面添写　my-vue-template，因为开发目录不在根目录

--------------------------------------------------------------