## 地址
https://www.lernajs.cn

## 使用
 > 初始化
    ```bash
        lerna init
    ```
    生成lerna.json
 > 针对某个包安装依赖
   lerna add loadsh --scope reactivity
   如果不指定scope 会认为是所有包都需要安装的,在各个包下安装依赖

 > 新增包
   lerna create runtime-core
     会在packages下面生成目录 runtime-core
 > 连接本地package
   - 顶部package.json 修改. 开启workspaces  必须是 private 项目才可以开启 workspaces
   - 使用yarn install 安装