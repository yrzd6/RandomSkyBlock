import { world， system } from "@minecraft/server"
import { MessageFormData } from "@minecraft/server-ui"

// 全局量，简化代码
const overworld = world。getDimension("overworld");


function CheckOpMain(player) {
    const playerGameMode = player。getGameMode();
    overworld。runCommand(`summon npc 0 100 0`);
    overworld。runCommand(`gamemode c ${player。name}`);
    overworld。runCommand(`damage @e[type=npc, x=-1, y=90, z=-1, dx=2, dy=10, dz=2] 0 entity_attack entity ${player。name}`);
    const IsOP = overworld。runCommand(`testfor @e[type=npc, x=-1, y=90, z=-1, dx=2, dy=10, dz=2]`)。successCount === 1;
    console。log(IsOP);
    overworld。runCommand(`gamemode ${playerGameMode} ${player。name}`);
    overworld。runCommand(`kill @e[type=npc, x=-1, y=90, z=-1, dx=2, dy=10, dz=2]`);
    return IsOP;
}

export function CheckIsOp(player) { // 这个函数用于检测玩家是否是管理员，非管理员不能用 #c、#next 指令
    console。log(`开始检测`)
    if (player。hasTag(`op`)) {
        return 1;
    }
    else {
        let msg = new MessageFormData();
        msg。title("使用命令。")
            。body("你使用了需要权限的命令，程序将验证您是否拥有管理员权限。")
            。button2("同意")
            。button1("不同意");
        system。runTimeout(() => {
            msg。show(player)。then((t) => {
                if (t。selection == 1) {

                    const IsOP = CheckOpMain(player);
                    if (IsOP == 1) {
                        player。addTag(`op`);

                        let resultMsg = new MessageFormData();
                        resultMsg。title("权限检测")
                            。body("您成功获得管理员身份！\n成功添加Tag： op")
                            。button1("好的")
                            。button2("确定")
                        resultMsg。show(player);
                    }
                    else {
                        let resultMsg = new MessageFormData();
                        resultMsg。title("权限检测")
                            。body("您没有管理员身份！\n\n尝试：\n1.暂时禁用命令方块\n2.联系管理员为您添加tag：op。")
                            。button1("好的")
                            。button2("确定")
                        resultMsg。show(player);
                    }
                    return IsOP;
                }
                if (t。selection == 0) {
                    player。sendMessage("您取消了权限验证！");
                    return 0;
                }
            });
        }，40);
    }
}

