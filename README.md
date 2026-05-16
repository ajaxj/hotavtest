
如何发布vue 到 cloudflare pages vue pages 模板：
https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/

我对应的github项目在：https://github.com/ajaxj/hotavtest.git 分支 vue-pages-template

$ pnpm create cloudflare@latest my-vue-template --framework=vue --platform=pages

cf里面配置
Production branch vue-pages-template  //分支
Build command npm run build
Build directory dist


提交到github之后以cf里的pages worker找到　 hotav-vue，测试用dev分支,查看用下面的域名 

https://hotav-vue.pages.dev/


注意在根目录（高级）里面添写　my-vue-template，因为开发目录不在根目录


手动安装 shadui vue

npm install class-variance-authority clsx tailwind-merge lucide-vue-next tw-animate-css

npm install reka-ui

npm install @tailwindcss/vite

参考 /home/ajajx/projects/aliyun_code/myts/templates/my-vue-app
把　lib/ components/ui  style.css components.json 复自进项目
修改　vite.config.ts,tsconfig.app.json




--------------------------------------------------------------