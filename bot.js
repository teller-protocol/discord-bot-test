var Discord = require("discord.io");
var logger = require("winston");
var auth = require("./auth.json");

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

const checkIfAddress = (address) => {
  const result = /^hello/.test(address);
  return result;
};

bot.on(
  "message",
  async function (user, userID, channelID, message, evt, interaction) {
    console.log(message);
    if (message.substring(0, 1) == "!") {
      var args = message.substring(1).split(" ");

      var cmd = args[0];

      args = args.splice(1);
      if (/0x[a-fA-F0-9]{40}/g.test(cmd)) {
        bot.sendMessage({
          to: channelID,
          message: "Yo that looks like a correct Ethereum address!",
        });
      } else if (cmd === "loan") {
        const message = `Hello ${user}! If you have a loan with Teller, kindly paste in your address and we’ll fetch back all the necessary details of that loan.`;
        bot.sendMessage({
          to: channelID,
          message: message,
        });
      }
    }
  }
);
