var Discord = require("discord.io");
var logger = require("winston");
var auth = require("./auth.json");
var gql = require("graphql-request");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { fromUnixTime, format } = require("date-fns");

// graphql client
const client = new gql.GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/teller-protocol/teller-v2"
);
// (where: { borrowerAddress: "${address}" })
const returnBidDetails = async (address) => {
  const query = gql.gql`
    {
      bids(where: { borrowerAddress: "${address}", status: "Accepted" }) {
        borrowerAddress
        lastRepaidTimestamp
        bidId
        status
        marketplaceId
        marketplace {
          metadataURI
        }
      }
    }
  `;

  const data = await client.request(query);
  return data;
};

const returnName = (metadataURI) => {
  let name;
  if (metadataURI[0] === "i") {
    const uriToQuery = "https://ipfs.io/ipfs/" + x.substring(12, x.length);
    queryIpfsMetadata(uriToQuery);
  } else {
    queryIpfsMetadata(metadataURI);
  }
  return name;
};

const queryIpfsMetadata = async (metadataURI) => {
  await fetch(metadataURI)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data.name;
    });
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
          // return loans
          const loans = bidDetails?.bids.filter(
            (value, index, self) => self.indexOf(value) === index
          );

          // return loans with metadata
          const loansWithMetadata = loans.map(async (x) => {
            const name = queryIpfsMetadata(x.marketplace.metadataURI);
            console.log("hello");
            console.log(name);
            return {
              ...x,
              name: name ? name : null,
            };
          });
          console.log(loansWithMetadata);
          // send message to user
          // const message = `Hello! The bid id ${bid.bidId} is a ${
          //   bid?.status
          // } loan. The last time this loan was repaid was on: ${returnDate(
          //   bid.lastRepaidTimestamp
          // )}`;

          // bot.sendMessage({
          //   to: channelID,
          //   message: message,
          // });
        }
      }
    }
  }
);
