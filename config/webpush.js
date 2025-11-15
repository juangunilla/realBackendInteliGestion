const webPush = require('web-push');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BCR9D5XjZRJ9KQaNdcnJieWn2xOLMCMLAxJOAjUE6Hs0QlwvIgZ3sD81_TukGuoiukt-sPD93lAr3Qv9ufePD_Y',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'bcWZPnrYdrwsS6ktpCHowwwqzAb8h54d2dfAU7SJT6Q',
};

webPush.setVapidDetails(
  process.env.VAPID_CONTACT || 'mailto:gunillajuan@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

module.exports = webPush;
