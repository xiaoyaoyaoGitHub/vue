// 这里我们就是要针对monorepo 进行编译项目

// 使用node 分析 package 目录

const fs = require('fs');
const path = require('path');
const execa = require('execa')
// 过滤下非文件夹 文件
const dirs = fs.readdirSync(path.resolve(__dirname, '../', 'packages')).filter(dir => fs.statSync(`packages/${dir}`).isDirectory())

// 循环打包
async function runParallel(dirs, iterFn) {
    let result = [];
    for (let dir of dirs) {
        result.push(iterFn(dir))
    }
    return Promise.all(result)
}
// 创建线程
async function build(target) {
    await execa('rollup', ['-c', '--environment', `TARGET:${target}`], { stdio: 'inherit' })
}


runParallel(dirs, build).then(() => {
    console.log('success');
})