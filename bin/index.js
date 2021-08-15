#!/usr/bin/env node
import chalk from 'chalk';
import fs from 'fs'
import path from 'path';
import input from "./input.js";
import { default as ejsRender } from "ejs";
let isFile = false;
let isDir = false;
let targetTemplate = ''
let configFile = 'config.json'
let hasConfigFile = true;

const log = {
    sucess(val) { console.log(chalk.blue(val))},
    warn(val) { console.log(chalk.yellow(val))},
    error(val) { console.log(chalk.red(val))},
}

async function inputCallback(config) {
    log.sucess(`命令行交互完成:${JSON.stringify(config)}`)
    const targetPath = (val) => {
        return path.resolve(config.path, config.name, val || '')
    }

    if (!fs.existsSync(config.path)) {
        console.log(chalk.red(`${config.path}文件目录不存在`,))
        return
    }

    if (fs.existsSync(targetPath())) {
        console.log(chalk.red(`${targetPath()}文件目录已经存在，创建终止`,))
        return
    }

    if (isFile) {
        const template = fs.readFileSync(path.resolve(targetTemplate)).toString()
        fs.writeFileSync(path.resolve(targetPath()), template)
        log.sucess(`文件创建完成`)
        return
    }

    if (isDir) {
        // 读取模板文件夹下面的所有文件名，ejs 做替换处理，文件夹做递归处理，其他文件做拷贝处理
        // 先找到 config.json 文件用于 ejs 做替换处理的准备工作
        let configJSON = null;
        const defaultCreatetConfig = {
            "path": "./src/",
            "replace": "template",
            "suffix": "ts"
        };
        const currentDirLists = fs.readdirSync(path.resolve(targetTemplate))
        hasConfigFile = currentDirLists.find(item => item === configFile)
        if (!hasConfigFile) {
            console.log(chalk.yellow('没有配置文件,碰到 ejs 文件内容将不做任何处理，ejs 文件名称将会直接替换为 name'))
        } else {
            configJSON = JSON.parse(fs.readFileSync(path.resolve(targetTemplate, configFile)).toString())
            log.sucess(`获取配置文件：${JSON.stringify(configJSON)}`)
            // 处理 createt 默认值
            if(!configJSON) {
                configJSON = configJSON || { createt: defaultCreatetConfig }    
            } else{
                let { createt, ejs} = configJSON;
                ejs = ejs || {};
                if(ejs.name) {
                    log.error(`config.json 中的 ejs.name 是保留属性，会被替换为 name ，请使用其他属性`)
                }
                ejs.name = config.name;
                createt = Object.assign(defaultCreatetConfig, createt)
                log.sucess(`获取配置文件处理完成：${JSON.stringify(configJSON)}`)
            }
        }
        // 递归模板文件夹下面的所有文件，完成拷贝动作
        const recursivePath = (templatePath) => {
            log.sucess(`递归目录是:${templatePath}`)
            const currentDirLists = fs.readdirSync(templatePath)
            let {createt, ...other} = configJSON
            currentDirLists.forEach(item => {
                const recursiveFile = path.resolve(targetPath(), '.' + templatePath.split(targetTemplate)[1], item)
                const recursiveDir = path.resolve(targetPath(), '.' + templatePath.split(targetTemplate)[1])
                const filePath = path.resolve(templatePath, item)
                let stat = fs.lstatSync(filePath);
                if (stat.isFile()) {
                    if (item.includes('ejs')) { // ejs 做文件名替换和内容模板处理
                        let newItem = item.replace('ejs', createt.suffix)
                        newItem = newItem.replace(createt.replace, config.name)
                        log.sucess(`ejs 文件名替换:${item} => ${newItem}`)
                        if (hasConfigFile) {
                            let { createt, ejs } = configJSON;
                            log.sucess(`查看 ejs 的配置：${JSON.stringify(ejs)}`)
                            const newEjs = ejsRender.render(fs.readFileSync(filePath).toString(), ejs)
                            fs.writeFileSync(path.resolve(recursiveDir, newItem), newEjs);
                        } else {
                            fs.writeFileSync(path.resolve(recursiveDir, newItem), fs.readFileSync(filePath).toString())
                        }
                    } else { // 非 ejs 文件，直接拷贝
                        if(item === configFile) {
                            log.sucess(`${configFile}，配置文件不做处理`)
                            return 
                        }
                        log.sucess(`文件拷贝:${filePath} => ${recursiveFile}`)
                        fs.writeFileSync(recursiveFile, fs.readFileSync(filePath).toString())
                    }
                } else {
                    // 文件夹创建文件夹了，然后继续递归处理
                    fs.mkdirSync(targetPath(item))
                    recursivePath(filePath)
                }
            })
        }
        fs.mkdirSync(targetPath())
        recursivePath(path.resolve('./',targetTemplate))
        return
    }
    console.log(chalk.red(`${targetTemplate}模板既不是文件也不是文件夹，你怎么做到的。请联系我645352780@qq.com`,))
}

function main() {
    const currentDirLists = fs.readdirSync('./')
    targetTemplate = currentDirLists.find(item => {
        return /^createTemplate.*/.test(item)
    })

    if (!targetTemplate) {
        log.red(`请创建模板文件或者模板文件夹`);
        return
    }

    let stat = fs.lstatSync(path.resolve(targetTemplate));

    if (stat.isFile()) {
        isFile = true;
        log.sucess('模板是一个文件')
    }

    if (stat.isDirectory()) {
        isDir = true;
        log.sucess('模板是一个文件夹')
    }

    input(inputCallback)
}

main()