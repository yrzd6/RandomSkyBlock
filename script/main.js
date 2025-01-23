import { system, world, BlockTypes } from "@minecraft/server"

// 全局量，简化代码
const overworld = world.getDimension("overworld");


// 获取方块列表
var AllBlocks = BlockTypes.getAll().map(element => element.id).sort();

// 黑名单
const BlackListBlocks = [
    /sign/, // 告示牌
    /button/, // 按钮
    /door/, // 门
    /coral/, // 珊瑚
    /element/, // 元素
    /light_block/, // 光源方块
    /rail/, // 铁轨
    /torchflower/, // 火把花
    /structure/, // 结构空位，结构方块
    /candle/, // 蜡烛（带蜡烛的蛋糕）
    /plate/, // 压力板
    /waterlily/, // 睡莲
    /poppy/, // 虞美人
    /sapling/ // 树苗
]

// 更新方块列表
const Blocks = AllBlocks.filter(item => {
    // 检查item是否与任何一个正则表达式匹配
    return !BlackListBlocks.some(pattern => pattern.test(item));
});

var nextBlock = null;
var ChangeTimes = 60;

var Timer = 0;
var InitFlag = false;



function randomBlock() {
    if (nextBlock == null)
        return Blocks[Math.floor(Math.random() * Blocks.length)];
    else {
        let returnBlock = nextBlock;
        nextBlock = null;
        return returnBlock;
    }
}

function ChangeBlocks() {
    var Debugblocks = []; // 仅供测试
    let BlockID = randomBlock(); // 随机抽取方块


    try {
        overworld.runCommand(`fill 5 10 5 0 8 3 ${BlockID}`);
        overworld.runCommand(`fill 0 8 2 2 10 0 ${BlockID}`);
        console.log(`当前填充的方块ID: ${BlockID}`);
    }
    catch {
        console.warn(`随机或指定的错误的方块ID: ${BlockID}`);
        console.log(`将重新设置方块。`)
        ChangeBlocks();
    };

}



function Init() {
    if (InitFlag) return;
    Timer = ChangeTimes;
    InitFlag = true;
    system.runInterval(() => Start(), 20); // 主循环
}

function Start() {

    let Progress = parseInt((ChangeTimes - Timer + 1) / ChangeTimes * 12); // 计算进度
    let ProgressBar = "§a" + "█".repeat(Progress) + "§f" + "█".repeat(12 - Progress);

    overworld.runCommand(`titleraw @a actionbar {"rawtext": [{"text":"距离方块变换还有 ${Timer} 秒。\n${ProgressBar}"}]}`);


    Timer -= 1;
    if (Timer == -1) {
        ChangeBlocks();
        Timer = ChangeTimes;
    }
};

function CheckIsOp(player) { // 这个函数用于检测玩家是否是管理员，非管理员不能用 #c、#next 指令
    return 1; 
}

world.beforeEvents.chatSend.subscribe((msg) => {
    let IsSenderOp = CheckIsOp(msg.sender); // 检查是否是管理员
    if (msg.message == "#c") {
        msg.cancel = true;
        if (IsSenderOp) {
            Timer = 0;
            msg.sender.sendMessage("已重新随机生成方块。");
        }
        else {
            msg.sender.sendMessage("您不是管理员!");
        }
    }
    if (msg.message.startsWith(`#next `)) {
        msg.cancel = true;
        if (IsSenderOp) {
            nextBlock = msg.message.substring(6).trim();
            if (nextBlock == "reset") {
                nextBlock = null;
                msg.sender.sendMessage("已取消设置下一个方块。");
                return;
            }
            msg.sender.sendMessage(`成功设置下一个方块为 ${nextBlock}。`);
        }
        else {
            msg.sender.sendMessage("您不是管理员!");
        }

    }
    if (msg.message.startsWith(`#set `)) {
        msg.cancel = true;
        let NewTimes = parseFloat(msg.message.substring(5).trim()); // 获取新设置的时间
        if (NewTimes < 1 || NewTimes > 32767) {
            msg.sender.sendMessage(`参数值 ${NewTimes} 出现问题，请输入 1 至 32767 之间的整数（单位：秒）。`);
            return;
        }
        ChangeTimes = NewTimes;
        Timer = ChangeTimes;
        msg.sender.sendMessage(`成功设置变化时间为 ${ChangeTimes} 秒。`);
    }
});


system.runTimeout(() => Init(), 10);
