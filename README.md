# 归途之下

郭子昊力学微文交互拓展网站。使用原生 HTML/CSS/JavaScript 和本地 Three.js，支持静态托管。

## 本地运行

在此目录执行 `node scripts/serve.mjs`，访问 http://127.0.0.1:4173 。不要用 file:// 打开，ES模块和论文正文需要HTTP。

## 校验

`node --test scripts/model.test.mjs` 验证四工况结果及退化关系。

## 内容与后续替换

- 主页面：dist/index.html
- 样式：dist/style.css
- 工程科普与响应式扩展样式：dist/engineering.css
- 交互：dist/app.js
- 参数联动受力图、逐步计算与模型稳定状态：dist/workbench.js
- 试验表与剖面点选：dist/engineering.js
- 三维模型：dist/scene.js
- 计算与阶段说明：dist/model.js
- 图像、论文正文、DOCX：dist/assets/

四工况采用论文中的公式与参数，工况切换时同步更新界面黏聚力、车辆荷载、容重与土重。公式窗口展示完整受力项及参数代入。论文 DOCX 保持不变。

实验室联动二维滑块、同尺度抗滑/下滑箭头、计算步骤和状态提示。稳定状态仅依据当前简化模型 Fs 与 1 的比较。试验表支持展开全部指标、点选样本及使用其强度参数试算；不会更改基准数据。

静态文件均本地提供，线上浏览不依赖第三方CDN。Three.js采用MIT许可，见dist/vendor/THREE-LICENSE.txt。二维码由qrcode-generator生成，其许可保留在scripts/vendor/qrcode.cjs文件头。

Netlify 配置位于 netlify.toml，发布目录固定为 dist；项目是预先生成的静态文件，无需安装依赖或执行框架构建。

发布配置在.openai/hosting.json中，项目ID应保留，不要重复注册新网站。
