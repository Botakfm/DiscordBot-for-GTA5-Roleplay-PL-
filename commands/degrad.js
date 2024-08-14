const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('degrad')
    .setDescription('Degraduj osobę z jednej roli i nadaj inną')
    .addStringOption(option =>
      option.setName('imie-i-nazwisko-ic')
        .setDescription('Imię i nazwisko IC')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('osoba')
        .setDescription('Podaj użytkownika, którego chcesz degradować')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('stara-rola')
        .setDescription('Rola, którą chcesz usunąć')
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
      option.setName('nowa-rola')
        .setDescription('Nowa rola, którą chcesz nadać')
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
      option.setName('powod')
        .setDescription('Podaj powód degradacji')
        .setRequired(true)
    ),

  async execute(interaction) {
    const imieINazwiskoIC = interaction.options.getString('imie-i-nazwisko-ic');
    const osoba = interaction.options.getUser('osoba');
    const staraRolaId = interaction.options.getString('stara-rola');
    const nowaRolaId = interaction.options.getString('nowa-rola');
    const powod = interaction.options.getString('powod');
    const ChannelID2 = config.ChannelID2;
    const UprawnioneRole = config.UprawnioneRole;
    const member = interaction.guild.members.cache.get(osoba.id);
    const logsChannelID = config.LogsChannelID;

    const logsChannel = interaction.guild.channels.cache.get(logsChannelID);

    if (!logsChannel) {
      return interaction.reply('Nie znaleziono kanału do logów');
    }

    if (!member) {
      return interaction.reply('Nie znaleziono użytkownika na serwerze');
    }


    const hasPermission = UprawnioneRole.some(roleId => interaction.member.roles.cache.has(roleId));
    if (!hasPermission) {
      return interaction.reply('Nie masz uprawnień do tej komendy');
    }

    const staraRola = interaction.guild.roles.cache.find(role => role.id === staraRolaId);
    const nowaRola = interaction.guild.roles.cache.find(role => role.id === nowaRolaId);
    const channel = interaction.guild.channels.cache.get(ChannelID2);

    if (!staraRola || !nowaRola) {
      return interaction.reply('Nie znaleziono jednej z wybranych ról');
    }

    if (!channel) {
      return interaction.reply('Nie znaleziono kanału o podanym ID');
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });

    try {
      await member.roles.remove(staraRola);
      await member.roles.add(nowaRola);

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle("Degradacja")
        .addFields(
          { name: 'Użytkownik', value: `${osoba}` }, 
          { name: 'Usunięty ze stanowiska:', value: `${staraRola.name}`, inline: true },
          { name: 'Nowe stanowisko:', value: `${nowaRola.name}`, inline: true },
          { name: 'Imię i nazwisko', value: `${imieINazwiskoIC}`, inline: false },
          { name: 'Powód', value: `${powod}`, inline: false }
        )
        .setFooter({ text: `Author: Kacper - BOTAKFM | Data: ${formattedDate}` })
        .setTimestamp();

      console.log("Sending embed: ", embed);
      await channel.send({ embeds: [embed] });
      await interaction.reply(`Zostałeś ZZZ||DEGRADOWANY|| HAHA`);

      const logEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('Komenda /degrad użyta przez:')
        .addFields(
          { name: 'Użytkownik', value: `${interaction.user.tag}`, inline: true },
          { name: 'ID Użytkownika', value: `${interaction.user.id}`, inline: true },
          { name: 'Komenda', value: '/degrad', inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: `Komenda użyta: ${formattedDate}` })
        .setTimestamp();

      await logsChannel.send({ embeds: [logEmbed] });

    } catch (error) {
      console.error(error);
      return interaction.reply('Wystąpił błąd podczas degradacji roli');
    }
  },
};
