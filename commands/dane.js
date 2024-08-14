const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const axios = require('axios');
const config = require(path.resolve(__dirname, '../config.json'));

const userData = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dane')
    .setDescription('Wprowadź dane osobowe')
    .addStringOption(option =>
      option.setName('imie_i_nazwisko_ic')
        .setDescription('Wprowadź imię i nazwisko IC')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('nr_konta')
        .setDescription('Wprowadź numer konta bankowego')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('nr_telefonu')
        .setDescription('Wprowadź numer telefonu')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ssn')
        .setDescription('Wprowadź SSN')
        .setRequired(true)
    ),

  async execute(interaction) {
    const imieINazwisko = interaction.options.getString('imie_i_nazwisko_ic');
    const nrKonta = interaction.options.getString('nr_konta');
    const nrTelefonu = interaction.options.getString('nr_telefonu');
    const ssn = interaction.options.getString('ssn');
    const user = interaction.user;
    const ChannelID4 = config.ChannelID4;
    const logsChannelID = config.LogsChannelID;
    const Permisje = config.Permisje;

    const channel = interaction.guild.channels.cache.get(ChannelID4);
    const logsChannel = interaction.guild.channels.cache.get(logsChannelID);

    if (!channel) {
      return interaction.reply('Nie znaleziono kanału o podanym ID');
    }

    if (!logsChannel) {
      return interaction.reply('Nie znaleziono kanału do logów');
    }

    if (!Array.isArray(Permisje)) {
      return interaction.reply('Błąd konfiguracji: Permisje powinny być tablicą.');
    }

    const hasPermission = Permisje.some(roleId => interaction.member.roles.cache.has(roleId));
    if (!hasPermission) {
      return interaction.reply('Nie masz uprawnień do tej komendy');
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });

    try {
      userData[user.id] = {
        imieINazwisko,
        nrKonta,
        nrTelefonu,
        ssn,
        date: formattedDate
      };

      // Wysyłanie danych do arkusza
      await axios.post('Your_sheetdb_API', {
        data: {
          ID: user.id,
          Imie_i_Nazwisko: imieINazwisko,
          Numer_Konta_Bankowego: nrKonta,
          Numer_Telefonu: nrTelefonu,
          SSN: ssn,
        }
      });

      const embed = new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle('Dane')
        .setDescription(`Zgłoszone przez: <@${user.id}>`)
        .addFields(
          { name: 'Imię i Nazwisko', value: imieINazwisko, inline: true },
          { name: 'Numer Konta Bankowego', value: nrKonta, inline: true },
          { name: 'Numer Telefonu', value: nrTelefonu, inline: true },
          { name: 'SSN', value: ssn, inline: true }
        )
        .setFooter({ text: `Autor: Kacper - botakfm | Data: ${formattedDate}` })
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      await interaction.reply(`Dane zostały pomyślnie przesłane na kanał ${channel.name}.`);

      const logEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('Komenda /dane użyta przez:')
        .addFields(
          { name: 'Użytkownik', value: `${interaction.user.tag}`, inline: true },
          { name: 'ID Użytkownika', value: `${interaction.user.id}`, inline: true },
          { name: 'Komenda', value: '/dane', inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: `Komenda użyta: ${formattedDate}` })
        .setTimestamp();

      await logsChannel.send({ embeds: [logEmbed] });

    } catch (error) {
      console.error(error);
      return interaction.reply('Wystąpił błąd podczas przetwarzania danych');
    }
  },

  getUserData(userId) {
    return userData[userId] || null;
  }
};
