#!/usr/bin/bash sh

 # 确保脚本抛出遇到的错误
set -e

# 获取Git远程仓库的推送地址（通常是GitHub仓库的URL）,并赋值给变量push_addr
push_addr=`git remote get-url --push origin`
# 获取Git提交信息，包括分支名称、提交哈希值和提交描述，并赋值给变量commit_info
commit_info=`git describe --all --long --always`
# 设置VuePress构建输出的目录路径，将其赋值给变量dist_dir
dist_path='docs/.vuepress/dist'
# 设置要推送到远程仓库的分支名称，将其赋值给变量push_branch
push_branch='gh-pages'


# 生成静态文件
pnpm run docs:build
# 进入生成的静态文件目录
cd $dist_path
# 初始化一个新的Git仓库
git init
# 将当前目录下的所有文件添加到Git暂存区
git add -A
# 提交暂存区的文件到Git仓库，并提供提交信息
git commit -m "deploy ${commit_info}"
# 将本地仓库推送到远程仓库的指定分支
git push -f $push_addr HEAD:$push_branch
# 返回到上一级目录
cd -
# 删除生成的静态文件目录
rm -rf $dist_path