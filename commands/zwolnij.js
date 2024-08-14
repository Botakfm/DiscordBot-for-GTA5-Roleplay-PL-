const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zwolnij')
    .setDescription('Zwolnij osobę z określonych ról i nadaj nową rolę')
    .addUserOption(option =>
      option.setName('osoba')
        .setDescription('Wybierz osobę do zwolnienia')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('powod')
        .setDescription('Podaj powód zwolnienia')
        .setRequired(true)
    ),

  async execute(interaction) {
    const osoba = interaction.options.getUser('osoba');
    const powód = interaction.options.getString('powod');
    const user = interaction.user;
    const UprawnioneRole = config.UprawnioneRole; 
    const RoleToRemove = config.RoleToRemove; 
    const RoleToAdd = config.RoleToAdd;
    const ChannelID6 = config.ChannelID6; 
    const logsChannelID = config.LogsChannelID;
    const logsChannel = interaction.guild.channels.cache.get(logsChannelID);
    
    if (!logsChannel) {
      return interaction.reply('Nie znaleziono kanału do logów');
    }

    const member = interaction.guild.members.cache.get(osoba.id);
    const channel = interaction.guild.channels.cache.get(ChannelID6);

    if (!channel) {
      return interaction.reply('Nie znaleziono kanału o podanym ID');
    }


    const hasPermission = UprawnioneRole.some(roleId => interaction.member.roles.cache.has(roleId));
    if (!hasPermission) {
      return interaction.reply('Nie masz uprawnień do tej komendy');
    }

    try {

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Zwolnienie')
        .setDescription(`Zwolniony: <@${osoba.id}> \nPowód: ${powód}`)
        .setFooter({ text: `Autor: Kacper - botakfm | Data: ${new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}` })
        .setTimestamp();


      await channel.send({ embeds: [embed] });

 
      if (member) {
        const rolesToRemove = RoleToRemove.map(roleId => interaction.guild.roles.cache.get(roleId)).filter(role => role);
        if (rolesToRemove.length > 0) {
          await member.roles.remove(rolesToRemove);
        } else {
          console.log('Nie znaleziono ról do usunięcia');
        }

        const roleToAdd = interaction.guild.roles.cache.get(RoleToAdd);
        if (roleToAdd) {
          await member.roles.add(roleToAdd);
        } else {
          console.log('Nie znaleziono roli do dodania');
        }
      } else {
        console.log('Nie znaleziono użytkownika');
      }


      await interaction.reply({ content: `Osoba <@${osoba.id}> została zwolniona.`, ephemeral: true });

      const logEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('Komenda /zwolnij użyta przez:')
        .addFields(
          { name: 'Użytkownik', value: `${interaction.user.tag}`, inline: true },
          { name: 'ID Użytkownika', value: `${interaction.user.id}`, inline: true },
          { name: 'Komenda', value: '/zwolnij', inline: true },
          { name: 'Data', value: `${new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}`, inline: false }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      await logsChannel.send({ embeds: [logEmbed] });

    } catch (error) {
      console.error(error);
      return interaction.followUp('Wystąpił błąd podczas przetwarzania danych');
    }
  },
};
