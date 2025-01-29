# Random Skyblock
MinecraftBE ScriptAPI Random Skyblock.

## 使用

1. 打开 `测试版API`。
2. 装载带有该文件的行为包。

## Commands

+ `#c` 立即随机一次方块。
+ `#set <time: number>` 设置每次方块随机变换的时间。
+ `#next <BlockID: string>` 指定下一次随机的方块。
+ `#next reset` 取消指定下一次随机的方块。
+ `#timer <time: number>` 设置当前计时器时间。

可在代码中自定义判断 OP 权限玩家的函数，函数检测返回值为`false`的玩家无法使用`#c`、`#next`命令。

## 计划
- [x] 添加 `#timer` 命令。
- [ ] 添加 `#tp` 命令供无权限的人请求传送至其他人。
- [ ] 添加 op 检测。

## Star 历史

<a href="https://star-history.com/#yrzd6/RandomSkyBlock&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=yrzd6/RandomSkyBlock&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=yrzd6/RandomSkyBlock&type=Date" />
   <img alt="Star 历史图表" src="https://api.star-history.com/svg?repos=yrzd6/RandomSkyBlock&type=Date" />
 </picture>
</a>
