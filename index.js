#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const program = require('commander'); // 可以自动的解析命令和参数，用于处理用户输入的命令
const download = require('download-git-repo'); // 用于下载模版
const inquirer = require('inquirer'); // 用于和用户交互
const handlebars = require('handlebars'); // 模板引擎，将用户提交的信息动态填充到文件中
const ora = require('ora'); // 下载过程久的话，可以用于显示下载中的动画效果。
const chalk = require('chalk'); // 可以给终端的字体设置样式。


program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        if(fs.existsSync(name)){ //判断目录是否存在
            console.log(chalk.red(`✖ <${name}> 目录已存在，请勿重复创建！`));
            return
        }
        inquirer.prompt([
            {
                name: 'projectName',
                message: `package name: (${name})`
            },
            {
                name: 'version',
                message: `version: (1.0.0)`
            },
            {
                name: 'description',
                message: 'description:'
            },
            {
                name: 'author',
                message: 'author:'
            }
        ]).then((answers) => {
            const spinner = ora('Downloading template...');
            spinner.start();
            download('github:xzblog/react-template#master', name, {clone: true}, (err) => {
                if(err){
                    spinner.fail();
                    console.log(chalk.red(err));
                    return
                }
                spinner.succeed();
                // 得到用户输入信息
                const meta = {
                    name: answers.projectName || name,
                    version: answers.version || '1.0.0',
                    description: answers.description,
                    author: answers.author
                };
                // 把用户输入信息写入package.json
                const fileName = `${name}/package.json`;
                const content = fs.readFileSync(fileName).toString();
                const result = handlebars.compile(content)(meta);
                fs.writeFileSync(fileName, result);
                console.log(chalk.green(`✨ Success! Created ${name} at ${path.join(__dirname, '')}`));

                console.log();
                console.log('-------------------------------------------------------');
                console.log('Inside that directory, you can run several commands:');
                console.log();
                console.log(chalk.green('npm install'));
                console.log('Installing packages');
                console.log();
                console.log(chalk.green('npm start'));
                console.log('Starts the development server');
                console.log();
                console.log(chalk.green('npm run build'));
                console.log('Bundles the app into static files for production.');
                console.log('-------------------------------------------------------');
                console.log();
            })
        })
    });

program.parse(process.argv);





