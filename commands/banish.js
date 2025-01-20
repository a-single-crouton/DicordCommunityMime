const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banish')
        .setDescription('Temporarily banishes a user to the confessional.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration') * 60 * 1000; // Convert minutes to milliseconds
        const member = await interaction.guild.members.fetch(targetUser.id);
        
        if (!member) {
            return interaction.reply({ content: 'User not found in the guild.', ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: "You can't timeout this user (they have equal or higher role).", ephemeral: true });
        }
        // Define the timeout role (change this to match your server setup)
        const timeoutRoleId = '1330070766938624021'; // Replace with actual role ID
        const timeoutRole = interaction.guild.roles.cache.get(timeoutRoleId);

        if (!timeoutRole) {
            return interaction.reply({ content: 'Timeout role not found. Please configure it.', ephemeral: true });
        }

        // Store the user's current roles (excluding `@everyone`)
        const originalRoles = member.roles.cache.filter(role => role.id !== interaction.guild.id);
        
        try {
            // Remove all roles except `@everyone` and add timeout role
            await member.roles.set([timeoutRole]);

            interaction.reply({ content: `${targetUser} has been timed out for ${duration / 60000} minutes.`, ephemeral: false });

            // Restore roles after the timeout period
            setTimeout(async () => {
                try {
                    await member.roles.set([...originalRoles.keys()]);
                    await interaction.followUp({ content: `${targetUser} has been restored to their original roles.`, ephemeral: false });
                } catch (restoreError) {
                    console.error('Failed to restore roles:', restoreError);
                }
            }, duration);

        } catch (error) {
            console.error('Error applying timeout:', error);
            interaction.reply({ content: 'An error occurred while timing out the user.', ephemeral: true });
        }
    }
};