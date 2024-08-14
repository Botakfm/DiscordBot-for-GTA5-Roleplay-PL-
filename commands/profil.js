const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Wyświetla profil użytkownika')
    .addUserOption(option =>
      option.setName('osoba')
        .setDescription('Wybierz osobę, której profil chcesz wyświetlić')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('osoba');
    const userId = user.id;

    // Funkcja do pobierania danych z arkusza
    const fetchUserProfile = async (userId) => {
      try {
        const response = await axios.get('SHEETDB_API', {
          params: {
            query: JSON.stringify({ ID: userId })
          }
        });
        return response.data;
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        return null;
      }
    };

    const userProfiles = await fetchUserProfile(userId);
    if (!userProfiles || userProfiles.length === 0) {
      await interaction.reply({ content: 'Nie znaleziono danych dla tego użytkownika.', ephemeral: true });
      return;
    }

    // Znajdź pierwszy pasujący wiersz
    const userProfile = userProfiles.find(profile => profile.ID === userId);
    if (!userProfile) {
      await interaction.reply({ content: 'Nie znaleziono danych dla tego użytkownika.', ephemeral: true });
      return;
    }

    // Wyciąganie danych z wiersza
    const { Imie_i_Nazwisko, Numer_Konta_Bankowego, Numer_Telefonu, SSN, Poprzednie_Stanowisko, Nowe_Stanowisko, Data_Awansu } = userProfile;

    const fields = [];
    if (Imie_i_Nazwisko) fields.push({ name: 'Imię i Nazwisko', value: Imie_i_Nazwisko, inline: true });
    if (Numer_Konta_Bankowego) fields.push({ name: 'Numer Konta Bankowego', value: Numer_Konta_Bankowego, inline: true });
    if (Numer_Telefonu) fields.push({ name: 'Numer Telefonu', value: Numer_Telefonu, inline: true });
    if (SSN) fields.push({ name: 'SSN', value: SSN, inline: true });
    if (Poprzednie_Stanowisko) fields.push({ name: 'Poprzednie Stanowisko', value: Poprzednie_Stanowisko, inline: true });
    if (Nowe_Stanowisko) fields.push({ name: 'Obecna Ranga', value: Nowe_Stanowisko, inline: true });
    if (Data_Awansu) fields.push({ name: 'Data ostatniego awansu', value: Data_Awansu, inline: true });

    // Wysyłanie odpowiedzi z embedem
    if (fields.length > 0) {
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`Profil użytkownika - ${user.username}`)
        .addFields(fields)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ content: 'Nie znaleziono danych dla tego użytkownika.', ephemeral: true });
    }
  },
};
