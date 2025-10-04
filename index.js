// index.js
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, Events } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

const prefix = '+';
const token = process.env.TOKEN || 'YOUR_BOT_TOKEN_HERE'; // حط توكن البوت هنا

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'startup') {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ ليس لديك صلاحية لاستخدام هذا الأمر.').then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
    }

    await message.delete().catch(() => {});

    const serverName = message.guild.name;
    const serverIcon = message.guild.iconURL({ dynamic: true });
    const date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' });

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${serverName} - Startup`, iconURL: serverIcon })
      .setDescription(
        `**شكراً لانضمامك إلى سيرفر ASWAYZ Community !!**

نرحب بك في مجتمع **ASWAYZ Community** ,  ونودُّ أن نُبرز لك بعض القوانين والأنظمة التي يجب عليك الإطلاع عليها لضمان تجربة افضل .

يمكنك ايضاً اختيار الإشعارات من القائمة أدناه .`
      )
      .setFooter({ text: date, iconURL: serverIcon })
      .setThumbnail(serverIcon)
      .setColor('#ff8c00');

    // القوائم (الاختيارات)
    const menu = new StringSelectMenuBuilder()
      .setCustomId('notice_select')
      .setPlaceholder('اضغط هنا لاختيار رتب الاشعارات . . .')
      .setMinValues(0)
      .setMaxValues(4)
      .addOptions([
        {
          label: 'تلقي اشعارات السيرفر والصيانة .',
          description: 'Server Notice',
          value: '1424047128854007839',
        },
        {
          label: 'تلقي اشعارات البثوث .',
          description: 'Live Notice',
          value: '1424047011757297799',
        },
        {
          label: 'تلقي اشعارات الالعاب والفعاليات .',
          description: 'Games Notice',
          value: '1424047080749404274',
        },
        {
          label: 'تلقي اشعارات الاجر .',
          description: 'AJR Notice',
          value: '1424047329400455249',
        },
      ]);

    // الأزرار
    const guidelinesBtn = new ButtonBuilder()
      .setCustomId('guidelines')
      .setLabel('Guidelines')
      .setStyle(ButtonStyle.Danger);

    const socialBtn = new ButtonBuilder()
      .setCustomId('social')
      .setLabel('Social Media')
      .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder().addComponents(menu);
    const row2 = new ActionRowBuilder().addComponents(guidelinesBtn, socialBtn);

    await message.channel.send({ embeds: [embed], components: [row1, row2] });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  // أزرار
  if (interaction.isButton()) {
    if (interaction.customId === 'guidelines') {
      return interaction.reply({
        content: `**مرحباً بك في مجتمعنا ASWAYZ Community**
** **
المجتمع لا يحتوي على ايّ قوانين ولكن هنالك بعض الالتزام يجب عليك كشخص الالتزام لها

\`-\` كن ودواً مع الاعضاء والادارة مع الالتزام بتوجيهات الإدارة .

\`-\` عدم اعتراض اوامر الإدارة او محاولة التدخل بشغلهم او انتحال شخصياتهم بأيِّ شكلٍ من الاشكال .

\`-\` الإدارة لها الحق بالتدخل في أيّ مشكلة ومحاولة حلّها .

\`-\` يحق للادارة دخول رومك الخاص داخل نطاق شغلهم .

\`-\` يمنع محاولة القذف / النشر / مناقشة أمور سياسة / التدخل بشغل الادارة

**كما اننا ننوه بحفظ جميع حقوق العضو داخل رومه وتذكرته الخاصة **`,
        ephemeral: true,
      });
    }

    if (interaction.customId === 'social') {
      return interaction.reply({
        content: `**مواقع التواصل الاجتماعي الخاصة بـ ASWAYZ :

<:19:1297970661679169586> [MTNEWS-Twitter](https://www.x.com/@MTNEWS_)
<:19:1297970661679169586> [ASWAYZ-Twitter](https://www.x.com/@ASWAYZ_)
<:ZKick:1309613959074283642> [MTNEWS-Kick](https://www.kick.com/mtnews)
[ASWAYZ-TikTok](https://www.tiktok.com/@aswayz1)**`,
        ephemeral: true,
      });
    }
  }

  // القائمة (اختيار الرتب)
  if (interaction.isStringSelectMenu() && interaction.customId === 'notice_select') {
    const selectedRoles = interaction.values;
    const member = interaction.member;

    let added = [];
    let removed = [];

    for (const roleId of selectedRoles) {
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) continue;

      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        removed.push(role.name);
      } else {
        await member.roles.add(roleId);
        added.push(role.name);
      }
    }

    let reply = '';
    if (added.length > 0) reply += `✅ Given: ${added.join(', ')}\n`;
    if (removed.length > 0) reply += `❌ Removed: ${removed.join(', ')}`;
    if (!reply) reply = 'No changes.';

    await interaction.reply({ content: reply, ephemeral: true });
  }
});

client.login(token);
