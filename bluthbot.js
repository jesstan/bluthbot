/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/
This is a sample Slack Button application that adds a bot to one or many slack teams.
# RUN THE APP:
  Create a Slack app. Make sure to configure the bot user!
    -> https://api.slack.com/applications/new
    -> Add the Redirect URI: http://localhost:3000/oauth
  Run your bot from the command line:
    clientId=<my client id> clientSecret=<my client secret> port=3000 node slackbutton_bot.js
# USE THE APP
  Add the app to your Slack by visiting the login page:
    -> http://localhost:3000/login
  After you've added the app, try talking to your bot!
# EXTEND THE APP:
  Botkit has many features for building cool and useful bots!
  Read all about it here:
    -> http://howdy.ai/botkit
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');

// Botkit-based Redis store
var Redis_Store = require('./redis_storage.js');
var redis_url = "rredis://h:p14f0ad0d4e92c182998f4fff029cd52a44d4c6d77c488907fcd68d7fc3f67b0e@ec2-107-22-239-248.compute-1.amazonaws.com:24139"
var redis_store = new Redis_Store({url: redis_url});

// Programmatically use appropriate process environment variables
try {
  require('./env.js');
} catch (e) {
    console.log('Not using environment variables from env.js. Error: ', e);
}

var port = process.env.PORT || process.env.port;
var http = require("http");

console.log("INSIDE BLUTHBOT.JS");
setInterval(function() {
    http.get("https://bluthbot.herokuapp.com/");
}, 1200000); // pings heroku every 20 minutes (1200000) to keep it awake

if (!process.env.clientId || !process.env.clientSecret || !port) {
  console.log('Error: Specify clientId clientSecret and port in environment');
}

var controller = Botkit.slackbot({
  storage: redis_store,
  // rtm_receive_messages: false, // disable rtm_receive_messages if you enable events api
}).configureSlackApp(
  {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: process.env.redirectUri, // optional parameter passed to slackbutton oauth flow
    scopes: ['bot'],
  }
);

controller.setupWebserver(port,function(err,webserver) {

  webserver.get('/',function(req,res) {
    res.sendFile('index.html', {root: __dirname});
  });

  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    } else {
      res.send('Success!');
    }
  });
});

// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.on('create_bot',function(bot,config) {
  console.log("create bot...");
  if (_bots[bot.config.token]) {
    console.log("bot appears to already be online");
    // already online! do nothing.
  } else {
    console.log("starting RTM...");
    bot.startRTM(function(err) {

      if (!err) {
        console.log("successfully started RTM");
        trackBot(bot);
      }

      bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
        if (err) {
          console.log(err);
        } else {
          //TODO: come up with better starter message
          convo.say('I am a bot that has just joined your team');
          convo.say('You must now /invite me to a channel so that I can be of use!');
        }
      });

    });
  }

});

// var bot = controller.spawn({
//     token: process.env.token
// }).startRTM();

// Handle events related to the websocket connection to Slack
controller.on('rtm_open',function(bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close',function(bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});

controller.hears(['hello', 'hi','annyong'],['direct_message','direct_mention'],function(bot,message) {
  console.log("bot heard message");
  bot.reply(message,'Annyong!');
});

controller.hears(['ham'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message, "So watery. And yet there's a SMACK of ham to it.");
});

controller.hears(['monster'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"I'M A MONSTER!!");
});

controller.hears(['brother'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,'Heyyy brother');
});

controller.hears(['award','army'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"These are my awards, Mother. From army.");
});

controller.hears(['come on'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,'COME ON!');
});

controller.hears(['mistake','huge'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"I've made a huge mistake");
});

controller.hears(['forget','remember'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"Take this and love me again!");
});

controller.hears(['lighter','fluid'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"But where did the lighter fluid come from...?");
});

controller.hears(['blue'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"I just blue myself");
});

controller.hears(['curious'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"I suppose I'm...buy-curious");
});

controller.hears(['Gene','Parmesan'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"GENE!!!");
});

controller.hears(['?'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"I don't understand the question, and I won't respond to it");
});

controller.hears(['mom'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"Mom's awesome");
});

controller.hears(['fire','sale'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"OH MY GOD! WE'RE HAVING A FIRE...sale!");
});

controller.hears(['leather'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"I'm looking for something that says, \"Dad likes leather.\"");
});

controller.hears(['never','nude'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"I understand more than you'll...never know.");
});

controller.hears(['note'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"And THAT'S why...you always leave a note");
});

controller.hears(['[A-Z]'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"And THAT'S why...you don't yell");
});

controller.hears(['Anne','Ann'],['direct_message','direct_mention','ambient'],function(bot,message) {
  var i = Math.floor(Math.random() * 2);
  if (i == 0) {
    bot.reply(message,"Her?");
  } else {
    bot.reply(message,"Egg?");
  }
});

controller.hears(['banana','stand','money'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"There's always money in the banana stand");
});

controller.hears(['husband','wife','crime'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"They can't convict a husband and wife for the same crime!");
});

controller.hears(['touching','touch'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"NO TOUCHING!");
});

controller.hears(['steve','holt'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"STEVE HOLT!");
});

controller.hears(['seal','loose'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"Loose seal!");
});

controller.hears(['bless','blessings'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"And as it is such, so also as such is it unto you");
});

controller.hears(['dragon','swoop'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"Swoop me, Dragon!");
});

controller.hears(['bye'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"And say goodbye...to these! Cuz it's the last time.");
});

controller.hears(['party','off the hook'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"This party's gonna be off the hook");
});

controller.hears(['father','uncle'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"You said my father was my father, but my uncle is my father. MY FATHER IS MY UNCLE!");
});

controller.hears(['marry'],['direct_message','direct_mention','ambient'],function(bot,message) {
  bot.reply(message,"Marry me!");
});

controller.hears('STFU',['direct_message','direct_mention'],function(bot,message) {
  bot.reply(message,'I shall be neither seen nor heard.');
  bot.rtm.close();
});

controller.on(['direct_message','mention','direct_mention'],function(bot,message) {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
  },function(err) {
    if (err) { console.log(err) }
    //bot.reply(message,'I heard you loud and clear boss.');
  });
});

controller.storage.teams.all(function(err,teams) {

  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (var t  in teams) {
    if (teams[t].bot) {
      controller.spawn(teams[t]).startRTM(function(err, bot) {
        if (err) {
          console.log('Error connecting bot to Slack:',err);
        } else {
          trackBot(bot);
        }
      });
    }
  }

});