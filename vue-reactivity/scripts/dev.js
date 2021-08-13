// 这里我们就是要针对monorepo 进行编译项目

// 使用node 分析 package 目录
const execa = require('execa')
// 循环打
// 创建线程
async function build(target) {
    await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], { stdio: 'inherit' }) //监听改动
}

build('runtime-dom')