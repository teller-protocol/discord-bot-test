var Discord = require("discord.io");
var logger = require("winston");
var auth = require("./auth.json");
var gql = require("graphql-request");
const { fromUnixTime, format } = require("date-fns");

// graphql client
const client = new gql.GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/teller-protocol/teller-v2"
);

const returnBidDetails = async (address) => {
  const query = gql.gql`
    {
      bids (where: { borrowerAddress: "${address}", status_not: "Cancelled" }){
        borrowerAddress
        lastRepaidTimestamp
        bidId
        status
      }
    }
  `;

  const data = await client.request(query);
  return data;
};

const returnDate = (epochTime) => {
  if (+epochTime != 0) return format(fromUnixTime(+epochTime), "PP");
};

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

bot.on(
  "message",
  async function (user, userID, channelID, message, evt, interaction) {
    if (message.substring(0, 1) == "!") {
      var args = message.substring(1).split(" ");
      var cmd = args[0];
      args = args.splice(1);

      if (/0x[a-fA-F0-9]{40}/g.test(cmd)) {
        const bidDetails = await returnBidDetails(cmd.toString());
        if (bidDetails?.bids.length === 0) {
          bot.sendMessage({
            to: channelID,
            message:
              "There are no bids within the Teller protocol containing that address!",
          });
        } else {
          const bid = bidDetails?.bids[0];
          const message = `Hello! The bid id ${bid.bidId} is a ${
            bid?.status
          } loan. The last time this loan was repaid was on: ${returnDate(
            bid.lastRepaidTimestamp
          )}`;
          console.log(message);
          bot.sendMessage({
            to: channelID,
            message: message,
          });
        }
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
