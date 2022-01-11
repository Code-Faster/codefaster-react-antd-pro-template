# codefaster-react-antd-pro-template

code-faster 模版项目，admin 管理系统，技术栈 react ant design pro typescript

### 项目 GUI 地址，提供基于任意语言任意模版的 项目 CURD 生成以及测试部署一体化

https://github.com/code-faster/code-faster

## src/index.ts 对外提供以下功能

```
// 初始化项目
init: (params: CodeFaster.Params) => void;
// 更新项目config结构，并返回结构JSON
updateProjectConfig: () => CodeFaster.ConfigJSON | undefined;
// 根据参数生成CURD页面
generatorPage: (params: CodeFaster.Params) => void;
```

## 如何发布自己的模版

### 自定义区域

```
1、package.json
项目的基础信息以及版本信息
2、playground
存放项目初始化文件
3、src/template
项目的 CURD 模版区域
4、.cfignore
项目的初始化文件拷贝需要忽略的地址
```

### package.json 参数

#### name

模版名称，以 codefaster-开始，以-template 结束

#### keywords 第一个关键词将作为模版标记的项目类型，例如：

```
1、Java【后台】
2、Admin【管理系统】
3、Web【含PC、H5、小程序】
4、App【Android、ios】
5、扩展更多语法
```

#### description

```
模版的描述信息
```

#### files

```
指定发布的模版文件
```

#### version

```
当前版本
```

#### license

```
模版 license
```
