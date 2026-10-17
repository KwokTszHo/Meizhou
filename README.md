# 归途之下

郭子昊力学微文交互拓展网站。以最初论文为资料源，使用原生HTML/CSS/JavaScript和本地Three.js，支持静态托管。

## 本地运行

在此目录执行 `node scripts/serve.mjs`，访问 http://127.0.0.1:4173 。不要用 file:// 打开，ES模块和论文正文需要HTTP。

## 校验

`node --test scripts/model.test.mjs` 验证原稿四工况结果及退化关系。

## 内容与后续替换

- 主页面：dist/index.html
- 样式：dist/style.css
- 交互：dist/app.js
- 三维模型：dist/scene.js
- 计算与阶段说明：dist/model.js
- 原论文图像、正文、DOCX：dist/assets/
- 计算复核建议：dist/assets/model-review.md

当前照片从DOCX提取，分辨率受原稿限制。完整签章检测报告待作者提供，目前只展示原稿表1转录。源论文保持不变。

静态文件均本地提供，线上浏览不依赖第三方CDN。Three.js采用MIT许可，见dist/vendor/THREE-LICENSE.txt。二维码由qrcode-generator生成，其许可保留在scripts/vendor/qrcode.cjs文件头。

发布配置在.openai/hosting.json中，项目ID应保留，不要重复注册新网站。
