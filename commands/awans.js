const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('awans')
    .setDescription('Awansuj osobę i usuń jej starą rolę')
    .addStringOption(option =>
      option.setName('nowa-rola')
        .setDescription('Wybierz rolę, którą chcesz nadać osobie')
        .setRequired(true)
        .setChoices(
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' }
        )
    )
    .addStringOption(option =>
      option.setName('stara-rola')
        .setDescription('Wybierz rolę, którą chcesz usunąć')
        .setRequired(true)
        .setChoices(
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' },
          { name: 'NAME', value: 'ID_ROLE' }
        )
    )
    .addStringOption(option =>
      option.setName('imie-i-nazwisko-ic')
        .setDescription('Imię i nazwisko IC')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('powod')
        .setDescription('Podaj powód')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('osoba')
        .setDescription('Podaj użytkownika, którego chcesz awansować')
        .setRequired(true)
    ),

  async execute(interaction) {
    const nowaRolaValue = interaction.options.getString('nowa-rola');
    const staraRolaValue = interaction.options.getString('stara-rola');
    const osoba = interaction.options.getUser('osoba');
    const ChannelID = config.ChannelID;
    const UprawnioneRole = config.UprawnioneRole;
    const member = interaction.guild.members.cache.get(osoba.id);
    const dane = interaction.options.getString('imie-i-nazwisko-ic');
    const powod = interaction.options.getString('powod');
    const logsChannelID = config.LogsChannelID; 

    if (!member) {
      return interaction.reply('Nie znaleziono użytkownika na serwerze');
    }

  
    const hasPermission = UprawnioneRole.some(roleId => interaction.member.roles.cache.has(roleId));
    if (!hasPermission) {
      return interaction.reply('Nie masz uprawnień do tej komendy');
    }

    const nowaRola = interaction.guild.roles.cache.find(role => role.id === nowaRolaValue);
    const staraRola = interaction.guild.roles.cache.find(role => role.id === staraRolaValue);
    const channel = interaction.guild.channels.cache.get(ChannelID); 
    const logsChannel = interaction.guild.channels.cache.get(logsChannelID); 

    if (!nowaRola) {
      return interaction.reply('Nie znaleziono nowej roli');
    }

    if (!staraRola) {
      return interaction.reply('Nie znaleziono starej roli');
    }

    if (!channel) {
      return interaction.reply('Nie znaleziono kanału o podanym ID');
    }

    if (!logsChannel) {
      return interaction.reply('Nie znaleziono kanału logów');
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });

    try {
      await member.roles.remove(staraRola);
      await member.roles.add(nowaRola);

      const embed = new EmbedBuilder()
        .setColor('#FFF182')
        .setTitle("Awans")
        .addFields(
          { name: 'Użytkownik', value: `${osoba}` },
          { name: 'Nowe stanowisko', value: `${nowaRola.name}`, inline: true },
          { name: 'Stare stanowisko', value: `${staraRola.name}`, inline: true },
          { name: 'Imię i nazwisko', value: `${dane}`, inline: false },
          { name: 'Powód', value: `${powod}`, inline: false }
        )
        .setFooter({ text: `Autor: Kacper - BOTAKFM | Data: ${formattedDate}` })
        .setTimestamp();

      console.log("Sending embed: ", embed);
      await channel.send({ embeds: [embed] });
      await interaction.reply(`Gratulacje awansu!!`);

      // Logi
      const logEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Komenda /awans użyta przez:')
        .addFields(
          { name: 'Użytkownik', value: `${interaction.user.tag}`, inline: true },
          { name: 'ID Użytkownika', value: `${interaction.user.id}`, inline: true },
          { name: 'Komenda', value: '/awans', inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: `Komenda użyta: ${formattedDate}` })
        .setTimestamp();

      await logsChannel.send({ embeds: [logEmbed] });

    } catch (error) {
      console.error(error);
      return interaction.reply('Wystąpił błąd podczas nadawania roli');
    }
  },
};
