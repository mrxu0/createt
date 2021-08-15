# 创建页面模板

平常写业务代码的时候基本上每个新页面都是相同的举例来说：

Vue 项目：
```
// 文件位置 views/Home/Home.vue
<template></template>
<script></script>
<style></style>
// 文件位置 views/Home/compontents
// home 页面后面可能用到的组件
```

nest 项目:
```
// 文件位置 src/home/home.controller.ts
// 文件位置 src/home/home.service.ts
// 文件位置 src/home/home.module.ts
// 文件位置 src/home/home/entities/home.entity.ts
// 文件位置 src/home/home/entities/dto/create.dto.ts
```

要是每次新建页面都去弄这么一套，是很麻烦的。因此做了这么一个插件，他会读取项目下面的 createTemplate 文件或者文件夹，然后在用户指定的位置创建相关的文件或者文件夹

操作如下：
```
// 全局安装
npm i -g createt

createt // 此命令执行会进入命令行交互

-- 请输入创建模板的路径(path)： ./src/views
-- 请输入创建模板文件的名字(name)：home.vue
```

**具体执行如下：**

如果是 createTemplate.vue (也可以是其他后缀，只要前缀是 createTemplate 即可) 文件，则会在 path.resolve(path, name) 目录创建 home.vue 文件

如果是 createTemplate 文件夹，则需要在里面添加 config.json 配置文件通常是
```
{
    "createt": {
        replate: "template", // 用于替换文件名相同的字符为 name
        suffix: "ts", // 用于将 ejs 后缀替换为对应的后缀
    },
    "ejs": {
        // 这里加入 ejs 用到的变量
    }
}
```
最后就会在 path.resolve(path, name) 目录创建 createTemplate 的拷贝，其中 ejs 文件会做相应的替换