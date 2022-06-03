var Discord = require("discord.io");

var logger = require("winston");

var auth = require("./auth.json");

console.log("test");
// Initialize Discord Bot
var bot = new Discord.Client({
  token: auth.token,

  autorun: true,
});

bot.on("ready", function (evt) {
  logger.info("Connected");

  logger.info("Logged in as: ");

  logger.info(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function (user, userID, channelID, message, evt) {
  // Our bot needs to know if it will execute a command

  // It will listen for messages that will start with `!`

  if (message.substring(0, 1) == "!") {
    var args = message.substring(1).split(" ");

    var cmd = args[0];

    args = args.splice(1);

    switch (cmd) {
      // !ping

      case "loan":
        const message = `Hello ${user}! If you have a loan with Teller, kindly paste in your address and we’ll fetch back all the necessary details of that loan.`;
        bot.sendMessage({
          to: channelID,
          message: message,
        });

        break;

      // Just add any case commands if you want to..
    }
  }
});
