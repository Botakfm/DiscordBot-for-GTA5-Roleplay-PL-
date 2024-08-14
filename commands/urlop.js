const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('urlop')
    .setDescription('Wprowadź dane urlopu')
    .addStringOption(option =>
      option.setName('imie_i_nazwisko_ic')
        .setDescription('Wprowadź imię i nazwisko IC')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('data_rozpoczecia')
        .setDescription('Wprowadź datę rozpoczęcia urlopu')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('data_zakonczenia')
        .setDescription('Wprowadź datę zakończenia urlopu')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('powod')
        .setDescription('Podaj Powód urlopu')
        .setRequired(true)
    ),

  async execute(interaction) {
    const imieINazwisko = interaction.options.getString('imie_i_nazwisko_ic');
    const dataRozpoczecia = interaction.options.getString('data_rozpoczecia');
    const dataZakonczenia = interaction.options.getString('data_zakonczenia');
    const powod = interaction.options.getString('powod');
    const user = interaction.user;
    const ChannelID5 = config.ChannelID5;
    const Permisje = config.Permisje; 
    const UrlopRola = 'ID_ROLE'; //CHANGE
    const logsChannelID = config.LogsChannelID;
    const logsChannel = interaction.guild.channels.cache.get(logsChannelID);
    const channel = interaction.guild.channels.cache.get(ChannelID5);

    if (!channel) {
      return interaction.reply({ content: 'Nie znaleziono kanału o podanym ID', ephemeral: true });
    }

    if (!logsChannel) {
      return interaction.reply({ content: 'Nie znaleziono kanału do logów', ephemeral: true });
    }

    const hasPermission = Permisje.some(roleId => interaction.member.roles.cache.has(roleId));
    if (!hasPermission) {
      return interaction.reply({ content: 'Nie masz uprawnień do tej komendy', ephemeral: true });
    }

    try {
      // Tworzenie embedu dla urlopu
      const embed = new EmbedBuilder()
        .setColor('#FFA500') 
        .setTitle(`Urlop - ${imieINazwisko}`)
        .setDescription(`Zgłoszone przez: <@${user.id}>`)
        .addFields(
          { name: 'Imię i Nazwisko', value: imieINazwisko, inline: true },
          { name: 'Data Rozpoczęcia Urlopu', value: dataRozpoczecia, inline: true },
          { name: 'Data Zakończenia Urlopu', value: dataZakonczenia, inline: true },
          { name: 'Powód', value: `${powod}`, inline: false }
        )
        .setFooter({ text: `Autor: Kacper - botakfm | Data: ${new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}` })
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      const member = await interaction.guild.members.fetch(user.id);
      if (member) {
        const RolaUrlop = interaction.guild.roles.cache.get(UrlopRola);
        if (RolaUrlop) {
          const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
          if (botMember.permissions.has('MANAGE_ROLES')) {
            await member.roles.add(RolaUrlop);
          } else {
            console.error('Bot nie ma uprawnień do zarządzania rolami');
            
            return interaction.reply({ content: 'Bot nie ma uprawnień do zarządzania rolami', ephemeral: true });
          }
        } else {
          console.error('Nie znaleziono roli o podanym ID');
          
          return interaction.reply({ content: 'Nie znaleziono roli o podanym ID', ephemeral: true });
        }
      } else {
        console.error('Nie znaleziono członka o podanym ID');
        
        return interaction.reply({ content: 'Nie znaleziono członka o podanym ID', ephemeral: true });
      }

     
      await interaction.reply({ content: 'Informacje o urlopie zostały przesłane.', ephemeral: true });

     
      const logEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('Komenda /urlop użyta przez:')
        .addFields(
          { name: 'Użytkownik', value: `${interaction.user.tag}`, inline: true },
          { name: 'ID Użytkownika', value: `${interaction.user.id}`, inline: true },
          { name: 'Komenda', value: '/urlop', inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: `Autor: Kacper - botakfm\nKomenda użyta: ${new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}` })
        .setTimestamp();

      await logsChannel.send({ embeds: [logEmbed] });

    } catch (error) {
      console.error(error);
      
      if (!interaction.replied) {
        await interaction.reply({ content: 'Wystąpił błąd podczas przetwarzania danych', ephemeral: true });
      } else {
        console.error('Nie udało się wysłać odpowiedzi do użytkownika po błędzie');
      }
    }
  },
};
