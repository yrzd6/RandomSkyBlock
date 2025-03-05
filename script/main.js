import { system, world, BlockTypes } from "@minecraft/server"
import { ActionFormData, MessageFormData, uiManager } from "@minecraft/server-ui"
import { CheckIsOp } from "./CheckOp"

// 全局量，简化代码
const overworld = world.getDimension("overworld");

// 获取方块列表
var allBlocks = BlockTypes.getAll().map(element => element.id).sort();

// 黑名单
const blackListBlocks = [
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
const blocks = allBlocks.filter(item => {
    // 检查item是否与任何一个正则表达式匹配
    return !blackListBlocks.some(pattern => pattern.test(item));
});

var nextBlock = null; // 下一个方块
var changeTimes = 120; // 默认改变时间

var timer = 0; // 计时器
var initFlag = false; // 是否初始化

function randomBlock() {
    if (nextBlock == null)
        return blocks[Math.floor(Math.random() * blocks.length)];
    else {
        let returnBlock = nextBlock;
        nextBlock = null;
        return returnBlock;
    }
}

function changeBlocks() {
    //var debugBlocks = []; // 仅供测试
    let blockID = randomBlock(); // 随机抽取方块

    try {
        overworld.runCommand(`fill 5 10 5 0 8 3 ${blockID}`);
        overworld.runCommand(`fill 0 8 2 2 10 0 ${blockID}`);
        console.log(`当前填充的方块ID: ${blockID}`);
    }
    catch {
        console.warn(`随机或指定的错误的方块ID: ${blockID}`);
        console.log(`将重新设置方块。`)
        changeBlocks();
    };
}

function init() {
    if (initFlag) return;
    timer = changeTimes;
    initFlag = true;
    system.runInterval(() => start(), 20); // 主循环
}

function start() {
    const progressNum = 60; // 进度条长度
    const progressChar = "∣"; // 进度条字符
    let progress = parseInt((changeTimes - timer + 1) / changeTimes * progressNum); // 计算进度
    let progressBar = "§m" + progressChar.repeat(progressNum);
    if(progress < 0)
        progress = 0; // 防止溢出
    if(progress > progressNum)
        progress = progressNum;
    try{ //防止 repeat 问题
        progressBar = "§a" + progressChar.repeat(progress) + "§f" + progressChar.repeat(progressNum - progress);
    }
    catch(e){
        console.error(e);
        console.warn(`进度: ${progress}`);
    }
    overworld.runCommand(`titleraw @a actionbar {"rawtext": [{"text":"距离方块变换还有 ${timer}/${changeTimes} 秒。\n${progressBar}"}]}`);

    timer -= 1;
    if (timer == -1) {
        changeBlocks();
        timer = changeTimes;
    }
};

world。beforeEvents。chatSend。subscribe((msg) => {
    msg。cancel = true; // 取消默认聊天行为
    let isSenderOp = true;//CheckIsOp(msg.sender); // 检查是否是管理员
    if (msg。message == "#c") {
        if (isSenderOp) {
            timer = 0;
            msg。sender。sendMessage("已重新随机生成方块。");
        }
        else {
            msg。sender。sendMessage("您不是管理员!");
        }
    }
    if (msg。message。startsWith(`#next `)) {
        if (isSenderOp) {
            nextBlock = msg。message。substring(6)。trim();
            if (nextBlock == "reset") {
                nextBlock = null;
                msg。sender。sendMessage("已取消设置下一个方块。");
                return;
            }
            msg。sender。sendMessage(`成功设置下一个方块为 ${nextBlock}。`);
        }
        else {
            msg。sender。sendMessage("您不是管理员!");
        }
    }
    if (msg。message。startsWith(`#set `)) {
        let newTimes = parseFloat(msg。message。substring(5)。trim()); // 获取新设置的时间
        if (newTimes < 1 || newTimes > 65535) {
            msg。sender。sendMessage(`参数值 ${newTimes} 出现问题，请输入 1 至 65,535 之间的整数（单位：秒）。`);
            return;
        }
        changeTimes = newTimes;
        timer = changeTimes;
        world。sendMessage(`成功设置变化时间为 ${changeTimes} 秒。`);
    }
    if (msg。message。startsWith(`#timer `)) {
        if (isSenderOp) {
            let newTimer = parseFloat(msg。message。substring(7)。trim()); // 获取新设置的时间
            if (newTimer < 1 || newTimer > 65535) {
                msg。sender。sendMessage(`参数值 ${newTimer} 出现问题，请输入 1 至 65,535 之间的整数（单位：秒）。`);
                return;
            }
            timer = newTimer;
            world。sendMessage(`成功设置计时器时间为 ${newTimer} 秒。`);
        }
        else {
            msg。sender。sendMessage("您不是管理员!");
        }
    }
    if (msg。message。trim() == `#tp`){
        system。runTimeout(()=>{
            uiManager。closeAllForms(msg。sender);
            toTeleport(msg。sender);
        }，10);
    }
});

function allowTeleportWindows(fromPlayer， toPlayer) {
    let messageForm = new MessageFormData()
    messageForm。title("申请传送通知")
        。body(`${fromPlayer。nameTag} 将要传送到您的位置。`)
        。button1("同意")
        。button2("取消")
    messageForm。show(toPlayer)。then((t) => {
        if (t。selection == 0) {
            overworld。runCommand(`tp ${fromPlayer。nameTag} ${toPlayer。nameTag}`);
            console。log(`tp ${fromPlayer。nameTag} ${toPlayer。nameTag}`);
        }
    })
};

function toTeleport(player) {
    let playerList = world。getAllPlayers();
    let playerNameList = playerList。map(pt => pt。nameTag);
    let teleportWindow = new ActionFormData()
    teleportWindow。title("传送 §t§lBy yrzd6")
        。body("请选择您要传送到的玩家: ")

    playerNameList。forEach(playerT => {
        teleportWindow。button(playerT， "textures/ui/gear");
    });
    teleportWindow。show(player)。then(t => {
        allowTeleportWindows(player， playerList[t。selection]);
    });
};

system。runTimeout(() => init()， 10);
