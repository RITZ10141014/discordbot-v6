const fs = require("fs")
const Keyv = require('keyv')
const cmdCD = require('command-cooldown');
const { measureMemory } = require("vm");

const prefix = 'c!';

const keyv = new Keyv('sqlite://db.sqlite');

const moneys = new Keyv('sqlite://db.sqlite', { table: 'moneys' })
moneys.on('error', err => console.error('Keyv connection error:', err))

const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' })
moneys.on('error', err => console.error('Keyv connection error:', err))

const userLevels = new Keyv('sqlite://db.sqlite')
userLevels.on('error', err => console.error('Keyv connection error:', err))

class Command {
async balance(message) {
    const money = (await moneys.get(message.author.id)) || { cash: 5000, bank: 0 };
    message.reply(
        `<@${message.author.id}>のお金💴\n${"```"}js\n＊手持ちのお金:${money.cash}円👛\n＊銀行のお金:${money.bank}円🏧${"```"}`
    );
    moneys.set(message.author.id, money)
}

async deposit(message) {
    const [command, ...args] = message.content.slice(prefix.length).split(/\s+/)
    const money = (await moneys.get(message.author.id)) || { cash: 5000, bank: 0 };
    const [a] = args.map(str => Number(str))

    if (a > 1)
        if (money.cash < a) {
            message.reply(
                `${"```"}＊手持ちのお金が足りません💸${"```"}`
            );
            return;
        }

    if (a >= 1) {
        money.bank += a;
        money.cash -= a;
        message.reply(
            `${"```"}js\n＊入金したお金:${a}円\n＊現在の銀行の合計金額:${money.bank}円${"```"}`
        );
    }
    else {
        message.reply(
            `${"```"}js\n＊入金したい金額を書いてください(一円以上)\n＊コマンド : c!deposit <入金したい金額>${"```"}`
        );
    }
    moneys.set(message.author.id, money)
}

async withdraw(message) {
    const [command, ...args] = message.content.slice(prefix.length).split(/\s+/)
    const money = (await moneys.get(message.author.id)) || { cash: 5000, bank: 0 };
    const [a] = args.map(str => Number(str))

    if (money.bank < a) {
        message.reply(
            `${"```"}＊銀行のお金が足りません💸${"```"}`
        );
        return;
    }

    if (a >= 1) {
        money.cash += a;
        money.bank -= a;
        message.reply(
            `${"```"}js\n＊出金したお金:${a}円\n＊現在の銀行の合計金額:${money.bank}円${"```"}`
        );
    }
    else {
        message.reply(
            `${"```"}＊出金したい金額を書いてください(一円以上)\n＊コマンド : c!withdraw <出金したい金額>${"```"}`
        );
    }
    moneys.set(message.author.id, money)
}

async ping(message,client) {
    let cd = await cmdCD.checkCoolDown(message.author.id, "cmd-ping");
    if (cd.res.spam) return;
    if (!cd.res.ready) return message.reply(`${"```"}js\n🤖そのコマンドが使えるまであと ${(cd.res.rem / 1000).toFixed(1)}秒🚀${"```"}`);
    message.reply(`${"```"}ポン！🏓${client.ws.ping}Ms${"```"}`);
    cmdCD.addCoolDown(message.author.id, 5000, "cmd-ping");
}

async work(message) {
    const money = (await moneys.get(message.author.id)) || { cash: 5000, bank: 0 };
    let cd = await cmdCD.checkCoolDown(message.author.id, "cmd-work");
    if (!cd.res.ready) return message.reply(`${"```"}js\n＊🤖そのコマンドは一時間のクールダウンの後に使えます🚀\n残り${(cd.res.rem / 1000 / 60).toFixed(1)}分${"```"}`);
    var randomwork = 1000 + Math.floor(Math.random() * 5000);
    money.cash += randomwork;
    message.reply(
        `${"```"}＊地下労働して${randomwork}円を手に入れた！💸${"```"}`
    );
    cmdCD.addCoolDown(message.author.id, 3600000, "cmd-work");
    moneys.set(message.author.id, money)
}

async send(message) {
    const [command, ...args] = message.content.slice(prefix.length).split(/\s+/)
    const money = (await moneys.get(message.author.id)) || { cash: 5000, bank: 0 };
    const [a] = args.map(str => Math.floor(Number(str))); console.log(a);
    if (message.mentions.members.size !== 1) return message.channel.send('メンバーを1人指定してください')
    const target = await message.mentions.members.first()
    const targetmoney = (await moneys.get(target.id)) || { cash: 5000, bank: 0 };
    if (Number.isNaN(a)) return message.reply('相手に渡す金額を指定してください');
    if (a <= 0) return message.reply('相手に渡す金額を指定してください');
    if (money.cash < a) return message.reply('所持金が足りません');
    money.cash -= a;
    targetmoney.cash += a;

    message.reply(`${a}円を${target}に送りました`);
    moneys.set(message.author.id, money);
    moneys.set(target.id, targetmoney);
}

async coinflip(message) {
    const [command, ...args] = message.content.slice(prefix.length).split(/\s+/)
    const money = (await moneys.get(message.author.id)) || { cash: 5000, bank: 0 };
    const [a, b] = args.map(str => Number(str))
    if (!b == 1 || !b == 2) {
        message.reply(
            `${"```"}＊表か裏を選んでください\n＊コマンド : c!coinflip <BETしたい金額> <表なら1裏なら2>${"```"}`
        );
        return
    }
    if (Number.isNaN(a)) return message.reply('相手に渡す金額を指定してください');
    if (a <= 0) return message.reply('相手に渡す金額を指定してください');
    if (money.cash < a) {

        message.reply(
            `${"```"}＊手持ちのお金が足りません💸${"```"}`
        );
        return
    }
    money.cash -= a;
    const side = Math.floor(Math.random() * 2 + 1);
    if (b == side) {
        money.cash += a * 2;
        message.reply(
            `${"```"}＊YOU WIN!🤑\n${a * 2}円を手に入れました！💴${"```"}`
        );

    }
    else if (b !== side) {
        message.reply(
            `${"```"}＊YOU LOOSE...${"(´；ω；`)ｳｯ…"}\n${a}円を失いました💸${"```"}`
        );
    }
    moneys.set(message.author.id, money)
}
async invite(message) {
    let cd = await cmdCD.checkCoolDown(message.author.id, "cmd-work");
    if (cd.res.spam) return;
    if (!cd.res.ready) return message.reply(`${"```"}js\n＊🤖そのコマンドは一時間のクールダウンの後に使えます🚀\n残り${(cd.res.rem / 1000 / 60).toFixed(1)}分${"```"}`);
    client.channels.cache.get('1098138385014607894').send(`${"<@&1097890550679613501>"}\nVCが開始されました！！！！みんな来て！\nhttps://discord.com/channels/1088080726991323226/1098138244186656798`)
    cmdCD.addCoolDown(message.author.id, 3600000, "cmd-work");
}
}
module.exports = Command;