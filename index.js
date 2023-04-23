const command = require("./command.js")
const commandclass = new command(); 
const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
const { token } = process.env;

const prefix = 'c!';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildScheduledEvents,
	],
	partials: [
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Message,
		Partials.Reaction,
		Partials.GuildScheduledEvent,
		Partials.ThreadMember,
	],
});

client.once('ready', () => {
	console.log('起動完了');
});

client.on('messageCreate', async (message) => {

	if (!message.content.startsWith(prefix)) return


	const [command, ...args] = message.content.slice(prefix.length).split(/\s+/)
	if (message.channel.id === "1098173242960789504") {
		//balance
		if (command === `balance` || command === `bal`) {
			commandclass.balance(message);
		}

		//deposit
		if (command === `deposit` || command === `dep`) {
			commandclass.deposit(message);
		}

		//withdraw
		if (command === `withdraw` || command === `with`) {
			commandclass.withdraw(message);
		}

		//ping
		if (command === `ping`) {
			commandclass.ping(message,client);
		}
		//work
		if (command === `work`) {
			commandclass.work(message);
		}
		//give
		if (command === `send`) {
			commandclass.send(message);
		}
		//coinflip
		if (command === `coinflip`) {
			commandclass.coinflip(message);
		}
		if (command === `vc-invite`) {
			commandclass.invite(message);
		}
	}
	else {
		message.reply(
			`${"```"}＊専用チャンネルのみ使用できます💸${"```"}`
		)
	}
})


client.login(token);