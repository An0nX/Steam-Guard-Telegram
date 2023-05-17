const TelegramBot = require('node-telegram-bot-api');
const SteamTotp = require('steam-totp');

// устанавливаем токен бота
const token = 'TELEGRAM BOT TOKEN';

// создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

// устанавливаем shared_secret из аккаунта Steam
const sharedSecret = process.env['shared_secret'];

let messageId = null; // храним id последнего сообщения с кодом Steam Guard

// определяем функцию для обновления сообщения с кодом Steam Guard
async function updateCode() {
  // генерируем код Steam Guard
  const code = SteamTotp.getAuthCode(sharedSecret);
  // формируем сообщение с моноширинным шрифтом для кода Steam Guard
  const message = 'Ваш код Steam Guard:\n' + '```\n' + code + '\n```';

  try {
    if (messageId) {
      // если id последнего сообщения существует, пытаемся обновить сообщение
      await bot.editMessageText(message, {
        chat_id: 'USER_ID',
        message_id: messageId,
        parse_mode: 'Markdown',
        disable_notification: true // отправляем сообщение бесшумно
      });
    } else {
      // иначе отправляем новое сообщение
      const sentMessage = await bot.sendMessage('USER_ID', message, { parse_mode: 'Markdown', disable_notification: true });
      messageId = sentMessage.message_id; // сохраняем id отправленного сообщения
    }
  } catch (error) {
    // если произошла ошибка при редактировании сообщения, удаляем старое сообщение
    if (messageId) {
      await bot.deleteMessage('USER_ID', messageId);
      messageId = null;
    }
    // и отправляем новое сообщение
    const sentMessage = await bot.sendMessage('USER_ID', message, { parse_mode: 'Markdown', disable_notification: true });
    messageId = sentMessage.message_id; // сохраняем id отправленного 
  }
}

// запускаем функцию отправки сообщения с кодом Steam Guard раз в 30 секунд
setInterval(updateCode, 30000);
