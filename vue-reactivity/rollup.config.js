import path from "path";
import ts from "rollup-plugin-typescript2"
import resolvePlugin from "@rollup/plugin-node-resolve"

// 获取package 目录
const packages = path.resolve(__dirname, 'packages');
console.log(`packages`, packages, process.env.TARGET);
const packagDir = path.resolve(packages, process.env.TARGET); //获取打包目录
console.log(`packagDir`, packagDir);
// 获取package.json文件
const packageJson = require(path.resolve(packagDir, 'package.json')) //获取package.json内容
console.log(`packageJson`,packageJson);
// 获取当前packagejson中的buildOption
const packageOptions = packageJson.buildOption;
console.log(`packageOptions`,packageOptions);
//文件夹的名称
const name = path.basename(packagDir);

// 基本配置
const optionsConfig = {
    "esm-bundler": {
        file: path.resolve(packagDir, `dist/${name}.esc-bundler.js`),
        format: "es"
    },
    "cjs": {
        file: path.resolve(packagDir, `dist/${name}.cjs.js`),
        format: 'cjs'   
    },
    'global': {
        file: path.resolve(packagDir, `dist/${name}.global.js`),
        format: 'iife'
    }
}

console.log(path.resolve(packagDir, 'src/index.ts'));

function createConfig(format, output) {
    output.name = packageOptions.name; // iife需要名称
    output.sourcemap = true; // 开启sourcemap
    output.exports = 'default'
    return {
        input: path.resolve(packagDir, 'src/index.ts'),
        output,
        plugins:[
            ts({
                tsconfig:path.resolve(__dirname, 'tsconfig.json')
            }),
            resolvePlugin()
        ]
    }
}

console.log(packageOptions.formats.map(format => createConfig(format, optionsConfig[format])));

export default packageOptions.formats.map(format => createConfig(format, optionsConfig[format]))