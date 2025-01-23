# Random Skyblock
MinecraftBE ScriptAPI Random Skyblock.

## 使用

1. 打开 `测试版API`。
2. 装载带有该文件的行为包。

## Commands

+ `#c` 立即随机一次方块。
+ `#set <time: number>` 设置每次方块随机的时间。
+ `#next <BlockID: string>` 指定下一次随机的方块。
+ `#next reset` 取消指定下一次随机的方块。

可在代码中自定义判断 OP 权限玩家的函数，函数检测返回值为`false`的玩家无法使用`#c`、`#next`命令。
