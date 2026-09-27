#!/bin/bash

set -e

cd /home/ajajx/projects/gitee.com/ajaxj/go2014/fynes/tvwork/tvapi

echo ">>> 开始编译 tvapi..."
go build -o tvapi

echo ">>> 编译成功，启动 tvapi..."
exec ./tvapi