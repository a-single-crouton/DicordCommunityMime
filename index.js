require('dotenv').config({path:'env/.env'});
const { Client, GatewayIntentBits } = require('discord.js');

const banish = require('./commands/banish');
const help = require('./commands/help');
const quote = require('./commands/quote');
 
const commands = require('./commands');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// Store commands in a Collection for easy access
client.commands = new Collection();

// Manually register commands
const commands = [ping, timeout, otherCommand];
commands.forEach(command => {
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`⚠️ Warning: Command "${command.data?.name || 'UNKNOWN'}" is missing "data" or "execute"`);
    }
});

// Bot Ready Event
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Handle Slash Command Interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`❌ No command found for ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`⚠️ Error executing ${interaction.commandName}:`, error);
        await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
    }
});