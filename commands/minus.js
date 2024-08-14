const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('minusik')
    .setDescription('Daj minusika szmato')
    .addUserOption(option =>
      option.setName('osoba')
        .setDescription('Wybierz osobę, której chcesz dać plusika')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('powod')
        .setDescription('Podaj powód')
        .setRequired(true)
    ),

  async execute(interaction) {
    const osoba = interaction.options.getUser('osoba');
    const powod = interaction.options.getString('powod');
    const member = interaction.guild.members.cache.get(osoba.id);
    const ChannelID3 = config.ChannelID3;


    const rolaX = 'ID_ROLE_EXAMPLE_MINUS(1/3)'; 
    const rolaY = 'ID_ROLE_EXAMPLE_MINUS(2/3)'; 
    const rolaZ = 'ID_ROLE_EXAMPLE_MINUS(3/3)';

    const channel = interaction.guild.channels.cache.get(ChannelID3);
    const logsChannelID = config.LogsChannelID;
    const logsChannel = interaction.guild.channels.cache.get(logsChannelID);

    if (!logsChannel){
      return interaction.reply('Nie znaleziono kanału do logów');
    }

    if (!channel) {
      return interaction.reply('Nie znaleziono kanału o podanym ID');
    }

    try { 
      let roleGiven = '';


      if (!member.roles.cache.has(rolaX) && !member.roles.cache.has(rolaY) && !member.roles.cache.has(rolaZ)) {
        await member.roles.add(rolaX);
        roleGiven = ``;
      } else if (member.roles.cache.has(rolaX)) {
        await member.roles.remove(rolaX);
        await member.roles.add(rolaY);
        roleGiven = ``;
      } else if (member.roles.cache.has(rolaY)) {
        await member.roles.remove(rolaY);
        await member.roles.add(rolaZ);
        roleGiven = ``;
      } else {
        roleGiven = ``;
      }

  
      const embed = new EmbedBuilder()
        .setColor('#FF2200')
        .setTitle('Minus')
        .addFields(
          { name: 'Użytkownik', value: `${osoba}`, inline: true },
          { name: 'Powód', value: `${powod}`, inline: false },
        )
        .setFooter({ text: `Kacper - BOTAKFM | Data: ${new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}` })
        .setTimestamp();


      await channel.send({ embeds: [embed] });


      await interaction.reply(`Użytkownik ${osoba.tag} otrzymał Minusa!`);

      const logEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('Komenda /minus użyta przez:')
        .addFields(
          { name: 'Użytkownik', value: `${interaction.user.tag}`, inline: true },
          { name: 'ID Użytkownika', value: `${interaction.user.id}`, inline: true },
          { name: 'Komenda', value: '/minus', inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: `Komenda użyta: ${formattedDate}` })
        .setTimestamp();

      await logsChannel.send({ embeds: [logEmbed] });

    } catch (error) {
      console.error(error);
      return interaction.reply('Wystąpił błąd podczas zarządzania rolami');
    }
  },
};
