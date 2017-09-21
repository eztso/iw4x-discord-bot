 const Discord = require('discord.js');
const mysql = require('mysql');
const Q3RCon = require('quake3-rcon');
const easytable = require('easy-table');
const Rcon = require('modern-rcon');
const rcon = require('rcon');

const bot = new Discord.Client();


bot.login("bot-token-here");

var noPerms = ('You do not have permission to do this :no_entry_sign:');

bot.on('ready', () => {
    console.log('Bot ready');
    bot.user.setGame(null);
});

bot.on('message', msg => ParseCommand(msg));
bot.on('disconnect', () => process.exit(1));

bot.on('guildMemberAdd', member => {
    var Welcome = new Discord.RichEmbed()
        .setTitle('Player Joined')
        .setColor('GREEN')
        .setDescription(`Welcome to the server, ${member}!`)

    member.guild.defaultChannel.sendEmbed(Welcome);
});

function ParseCommand(m) {
    if (m.content.substring(0, 1) == '!' ) {
        var command = m.content.split(' ')[0].substring(1).toLowerCase();
        var suffix = m.content.substring(command.length + 2);
        var args = suffix.split(' ');
        _channel = m.channel;
        _guild = m.guild;

        if (commandPermission[command]) {
            if (!HasCmdPermission(m.member, commandPermission[command]))
                return _channel.send(m.member + ' ' + noPerms);
        }


        switch (command) {

            case 'help':
            case 'h':
                return CommandHelp(command);
                break;
            case 'maprestart':
            case 'mr':
                RconCommand('map_restart');
                var mrEmbed = new Discord.RichEmbed()
                    .setTitle(':arrows_counterclockwise: Performing Full Map Restart...')
                    .setColor('GREEN')
                    .setDescription(' ')
                    .setThumbnail(args[0])
                _channel.sendEmbed(mrEmbed);
                break;
            case 'fastrestart':
            case 'fr':
                RconCommand('fast_restart');
                var frEmbed = new Discord.RichEmbed()
                    .setTitle(':arrows_counterclockwise: Performing Fast Restart...')
                    .setColor('GREEN')
                    .setDescription(' ')
                    .setThumbnail(args[0])
                _channel.sendEmbed(frEmbed);
                break;
            case 'b':
            case 'ban':
                if (!args[0])
                    return CommandHelp(command);
                RconCommand('tempbanUser ' + '"' + suffix + '"');
                break;
            case 'run':
            case 'eval':
            case 'e':
                if (!args[0])
                      return CommandHelp(command);
                  runjs(suffix);
                  break;
            case 'rcon':
            if (!args[0]) return CommandHelp(command);
                rconjes(suffix, res => {
                    m.channel.send(res, {
                        code: 'xd'
                    });
                })
                break;
            case 'setavatar':
                if (!args[0])
                    return CommandHelp(command);
                try {
                    var AvatarEmbed = new Discord.RichEmbed()
                        .setTitle(':frame_photo: Avatar Changed Successfully')
                        .setColor('GREEN')
                        .setDescription('Changes Applied :white_check_mark:')
                        .setThumbnail(args[0])

                    _channel.sendEmbed(AvatarEmbed);
                } catch (e) {
                    _channel.send('**ERROR**```http\nCouldn\'t set avatar');
                }
                break;
			case 'l':
            case 'lookup':
                if (!args[0])
                    return (CommandHelp(command));
                lookup(suffix);
                break;
            case 'uptime':
                var wealthy = new Discord.RichEmbed()
                    .setTitle(':clock10: __Bot Uptime__')
                    .setColor(0x00AE86)
                    .setDescription('**' + (Math.round(bot.uptime / (1000 * 60 * 60))) + '**' + " hours, " + '**' + (Math.round(bot.uptime / (1000 * 60)) % 60) + '**' + " minutes, and " + '**' + (Math.round(bot.uptime / 1000) % 60) + '**' + " seconds.")
                _channel.sendEmbed(wealthy);
                break;
            case 'speak':
                if (!args[0])
                    return CommandHelp(command);
                m.delete();
                _channel.sendMessage(suffix);
                break;
            case 'admins':
            var wealthy = new Discord.RichEmbed();
            var connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'b3'
            });


            connection.connect();

            connection.query('select name, group_bits from b3.clients where group_bits > 2 order by group_bits desc', function(error, results, fields) {
                if (error) throw error;
                var adminName = [];
                var adminLevel = [];
                for (var i = 0; i < results.length; i++) {
                    adminName.push(results[i].name);
                    adminLevel.push(results[i].group_bits);
                }

                wealthy.setTitle(':shield: Admins List')
                wealthy.addField('__Name__', adminName.join('\n'), true);
                wealthy.addField('__Level__', adminLevel.join('\n'), true);
                wealthy.setColor(0xff0000);
                _channel.sendEmbed(wealthy);
            });
            connection.end();
            break;
            case 'map':
                if (!args[0])
                    return CommandHelp(command);
                RconCommand('map ' + args[0]);
                break;
            case 'status':
            case 's':
                require('request-promise').get('http://SERVER_IP_HERE:PORT_HERE/info').then(result => {
                    var players = JSON.parse(result).players.map(x => x.name.replace(/\^[0-9;:]/g, ''))
                    var scores = JSON.parse(result).players.map(x => x.score)




                    require('request-promise').get('http://SERVER_IP_HERE:PORT_HERE/info').then(result => {
                        var map = JSON.parse(result).status.mapname;
                        var status = new Discord.RichEmbed()
                            .setTitle('**Sunbae Nuketown Sniper**')
                            .setColor('GREEN')
                            .setDescription('[__Join Server__](iw4x://SERVER_IP_HERE:PORT_HERE)')
                            .addField('__**Online Players: ' + '(' + players.length + ('/18)**__'), (players.join('\n')), true)
                            .addField('__**Score:**__', (scores.join('\n')), true)
                            .setFooter('Server IP: SERVER_IP_HERE:PORT_HERE')
                        if (map === 'mp_nuked') {
                            status.setThumbnail('http://quickman.gameological.com/wp-content/uploads/2013/01/130129_otl_nuketown_town.jpg')
                        } else {
                          return;
                        }
                        _channel.sendEmbed(status);
                    })
                })
                break;
            case 'shout':
                m.delete();
                _channel.send(suffix, {
                    tts: true
                });
                break;
            case 'seen':
                if (!args[0])
                    return CommandHelp(command);
                seen(suffix);
                break;
            case 'tts':
                m.delete();
                _channel.send(suffix, {
                    tts: true
                }).then(msg => msg.delete());;
                break;
            case 'dkick':
                var kickable = (_guild.member.kickable = true)
                var Kicked = new Discord.RichEmbed()
                    .setTitle(':boot: Kicked User')
                    .setColor('RED')
                    .setDescription('Kicked ' + m.mentions.users.first())
                _guild.member(m.mentions.users.first()).kick().then(member => _channel.sendEmbed(Kicked)).catch(error => m.channel.send('Error:\nCould not kick this user.\nCheck your permissions before using this command'));
                break;
            case 'dban':
                var Banned = new Discord.RichEmbed()
                    .setTitle(':hammer: Banned User')
                    .setColor('RED')
                    .setDescription('Banned ' + m.mentions.users.first())
                _guild.member(m.mentions.users.first()).ban().then(member => _channel.sendEmbed(Banned)).catch(error => m.channel.send('Error:\nCould not ban this user.\nCheck your permissions before using this command'));;
                break;
            case 'ip':
            case 'iplookup':
                if (!args[0])
                    return (CommandHelp(command));
                iplookup(suffix);
                break;
            case 'say':
                if (!args[0])
                    return CommandHelp(command);
                RconCommand('say ' + '^7' + suffix );
                break;
            case 'purge':
            case 'p':
                function del() {
                    m.delete;
                }
                if (!args[0])
                    return CommandHelp(command);
                if (args[0] === '1') {
                    m.delete().then(msg => msg.delete());
                }
                else if (args[0] > 1 && args[0] < 101) {
                    m.delete();
                    _channel.bulkDelete((suffix));
                    var rich = new Discord.RichEmbed()
                        .setTitle(':wastebasket: Purged Successfully')
                        .setColor('GREEN')
                        .setDescription('***' + (suffix) + '***' + ' *messages were successfully deleted*')
                    _channel.send({
                        embed: rich
                    }).then(msg => msg.delete(5000))
                }
                else if (args[0] > 100) {
                    _channel.bulkDelete((100));
                    var rich = new Discord.RichEmbed()
                        .setTitle(':warning: Purge Capped')
                        .setColor('RED')
                        .setDescription('**You tried to purge more than 100 messages. Only the last 100 messages were deleted.**')
                    _channel.send({
                        embed: rich
                    }).then(msg => msg.delete(8000))
                }
                else if (args[0] == 0) {
                  _channel.send('*You cannot purge zero messages. Take a look at the instructions for this command:*')
                  return CommandHelp(command)
                }
                else if (args[0] < 0) {
                  _channel.send('*You cannot purge a negative number of messages. Take a look at the instructions for this command:*')
                  return CommandHelp(command)
                }
                break;
            case 'kick':
            case 'k':
            if (!args[0])
                return CommandHelp(command);
            RconCommand('onlykick ' + '"' + suffix + '"');
            break;
            case 'mute':
            case 'm':
            guild.addRole(rolereason)
            break;
            case 'botinfo':
                botinfo();
                break;

        }
    }
}

function rconjes(x, callback) {
    const options = {
        tcp: false,
        challenge: false
    };
    const conn = new rcon('RCON_IP_HERE', PORT_HERE, 'RCON_PASS_HERE', options)    //////////////////////////////////////////rcon password goes here/////////////////////////////////////////////////////////////////////////
        .on('auth', () => conn.send(x))
        .on('response', res => {
            callback(res.replace('rint', ''));
        })
    conn.connect();
}

var commandPermission = {
    help: ['@everyone'],
    eval: ['Developer'],
    e: ['Developer'],
    run: ['Developer'],
    setavatar: ['Developer'],
    speak: ['Developer'],
    shout: ['Developer'],
    map: ['Developer'],
    purge: ['Developer'],
    rcon: ['Developer'],
    say: ['Developer'],
    ip: ['Developer'],
    iplookup: ['Developer'],
    maprestart: ['Developer'],
    ban: ['Developer', 'MW2 Admin'],
    kick: ['Developer', 'MW2 Admin'],
    unban: ['Developer', 'MW2 Admin'],
	lookup: ['Developer', 'MW2 Admin'],
    l: ['Developer', 'MW2 Admin'],
    fastrestart: ['Developer', 'MW2 Admin'],
    dban: ['Developer', 'Discord Manager'],
    dkick: ['Developer', 'Discord Manager'],
    mute: ['Developer', 'Discord Manager'],
    m: ['Developer', 'Discord Manager'],
};

function HasCmdPermission(member, command) {
    for (var i = 0; i < command.length; i++) {
        if (HasPermissions(member, command[i]))
            return true;
    }
    return false;
}

function HasPermissions(member, roleByName) {
    if (member.roles.has(_guild.roles.find('name', roleByName).id)) {
      return true;
    }
    else {
    return false;
  }
}

function CommandHelp(command) {
    var embedMessage = new Discord.RichEmbed();
    var description;
    var color;
    var title;
    var field1 = {
        name: undefined,
        value: undefined
    }
    var field2 = {
        name: undefined,
        value: undefined
    }
    var field3 = {
        name: undefined,
        value: undefined
    }
    var field4 = {
        name: undefined,
        value: undefined
    }



    switch (command) {
        case 'help':
        case 'h':
            _channel.sendMessage('***Server Commands***')
            _channel.sendMessage('*Use the*  **!** *prefix to call a command*')
            title = ':computer: __Developer Commands__'
            description = '!setAvatar - Change the bot avatar\n!run - Execute JS Code\n!speak - Speak as the bot\n!say - Speak through RCON to the server\n!shout - Speak as the bot using tts\n!map - Change the map\n!purge - Bulk delete messages\n!rcon - Send RCON commands to the server\n!maprestart - Perform a full map restart\n!iplookup - Search for a player\'s IP Address'
            field2.name = ':beginner: __Admin Commands__';
            field2.value = '!kick - Kick players from the MW2 server\n!ban - Ban players from the MW2 server\n!unban - Unban players from the MW2 server\n!fastrestart - Perform a fast restart';
            field1.name = ':cop::skin-tone-2: __Discord Manager Commands__'
            field1.value = '!dBan - Ban users from the Discord Server\n!dKick - Kick users from the Discord Server\n!mute - Prohibit users from talking'
            field3.name = ':keyboard: __Basic Commands__';
            field3.value = '!s - Check server status and online players\n!report - Report a user to the admins\n!seen - Check when a player last joined the server\n!admins - See a list of admins\n!botinfo - Check bot version number\n!uptime - Check the uptime of the bot';
            break;
        case 'say':
            title = ':speech_left:  __Say__';
            description = 'Speak as the console in the server';
            field1.name = '**Usage:**';
            field1.value = ';say <message>'
            break;
        case 'kick':
        case 'k':
            title = '<:booted:351927860606533632> __Kick Command__';
            description = 'Kick a player from the server by their username';
            field1.name = '**Usage:**';
            field1.value = ';kick <Player Name>'
            break;
        case 'iplookup':
        case 'ip':
            title = ':mag: __IP Lookup__';
            description = 'Fetch the IP Address of any player by name';
            field1.name = '**Usage:**';
            field1.value = '!iplookup <Player Name>'
            break;
        case 'seen':
            title = ':calendar: __Last Seen__';
            description = 'Check when a player last joined the server';
            field1.name = '**Usage:**';
            field1.value = '!seen <Player Name>'
            break;
        case 'speak':
            title = ':speaking_head: __Speak__';
            description = 'Send messages as the bot';
            field1.name = '**Usage:**';
            field1.value = '!speak <Message>'
            break;
        case 'run':
        case 'eval':
        case 'e':
            title = '<:terminal:351926575463399454> __Run Command__';
            description = 'Evaluate JavaScript';
            field1.name = '**Usage:**';
            field1.value = '!run <script>'
            break;
        case 'purge':
        case 'p':
            title = ':wastebasket: __Purge Command__';
            description = 'Delete a number of messages in bulk';
            field1.name = '**Usage:**';
            field1.value = '!purge <number>'
            break;
        case 'rcon':
            title = '<:terminal:351926575463399454> __RCON Command__';
            description = 'Send RCON commands to the server';
            field1.name = '**Usage:**';
            field1.value = '!rcon <parameters>'
            break;
        case 'setavatar':
            title = ':frame_photo: __SetAvatar Command__';
            description = 'Set the bot avatar';
            field1.name = '**Usage:**';
            field1.value = '!setAvatar <URL>'
            break;
    }
    embedMessage
        .setTitle(title)
        .setColor(0x00AE86)
        .setDescription(description)

    if (field1.name && field1.value)
        embedMessage.addField(field1.name, field1.value);
    if (field2.name && field2.value)
        embedMessage.addField(field2.name, field2.value);
    if (field3.name && field3.value)
        embedMessage.addField(field3.name, field3.value);


    _channel.sendEmbed(
        embedMessage, '', {
            disableEveryone: true
        }
    );
}


function RconCommand(query) {
    var rcon = new Q3RCon({
        address: 'server IP goes here, or you can use localhost',
        port: 28960,
        password: 'rcon-password-here'
    });

    rcon.send(query, function(response) {
        if (query == 'status') {
            var rat = response.replace('print', '').toString().replace(/([0-9\.]+:2896[0-9])/ig, '00.00.00.00');
            return _channel.sendCode(null, rat);
        }

        _channel.sendCode(null, response.replace("print", ""));
    });
}


function KickPlayer(username) {
    var msg = _channel.send('**_```css\nLoading ...```_**');
    RconCommand('status', 28960, r => {
        var result;
        var players = [];
        var matched = [];
        var rx = /[0-9a-z]{16} .+\^7/ig;
        while ((result = rx.exec(r)) != null) players.push(result.toString().substring(17).replace('^7', ''))
        for (var i = 0; i < players.length; i++) {
            var match = players[i].toLowerCase().indexOf(username.toLowerCase());
            if (match > -1) {
                matched.push(players[i]);
            }
        }
        if (matched.length == 0) {
            msg.then(m => m.delete());
            return _channel.send('No matching players found.');
        } else if (matched.length > 1) {
            msg.then(m => m.delete());
            return _channel.send('Matched more than one player: `' + matched.join(', ') + '`, please use a more specific parameter.');
        } else {
            Rcon('kick ' + matched[0], 28960, r => {
                msg.then(m => m.edit('🔨 **Player _' + matched[0] + '_ successfully kicked.**'));
            });
        }
    });
}

function runjs(code) {
    try {
        var evaled = eval(code);

        if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);

        _channel.sendCode("js", evaled);
    } catch (err) {
        _channel.send('that make no sense men');
    }
}

function seen(name) {
    var wealthy = new Discord.RichEmbed();
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'b3'
    });


    connection.connect();

    connection.query('select name, time_edit from b3.clients where name REGEXP ?', name, function(error, results, fields) {
        if (error) throw error;
        var seenName = [];
        var seenTime = [];


        for (var i = 0; i < results.length; i++) {

            seenName.push(results[i].name);
            seenTime.push(new Date(results[i].time_edit * 1000));

        }

        if (results.length == 0) {

            wealthy.setTitle(':mag: No Results Found');
            wealthy.setColor(0xff0000);
            _channel.sendEmbed(wealthy);
            return;

        }

        wealthy.setTitle(':calendar: Last Seen');
        wealthy.addField('__Name__', seenName.join('\n'), true);
        wealthy.addField('__Seen On__', seenTime.join('\n'), true);
        _channel.sendEmbed(wealthy);
        //  wealthy.setColor(0xff0000);
        //  _channel.sendEmbed(wealthy);('Results', lookup.join('\n'));
    });
    connection.end();
}

function iplookup(name) {
    var wealthy = new Discord.RichEmbed();
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'b3'
    });


    connection.connect();

    connection.query('select name, ip from b3.clients where name REGEXP ?', name, function(error, nameresults, fields) {
        if (error) _channel.send(error);
        var nameresults = [];
        var ipresults = [];
        for (var i = 0; i < nameresults.length; i++) {
            nameresults.push(results[i].name);
            ipresults.push(results[i].ip);
                 }

        if (nameresults.length == 0) {

          wealthy.setTitle(':mag: __No Results Found__');
          wealthy.setColor('BLUE');
          _channel.sendEmbed(wealthy);
          return;
      }

        wealthy.setTitle(':mag: ' + 'IP Lookup');
        wealthy.addField('__Name__', nameresults.join('\n'), true);
        wealthy.addField('__IP__', ipresults.join('\n'), true);
        wealthy.setColor(0xff0000);
        _channel.sendEmbed(wealthy);
    });
    connection.end();
}

function lookup(name) {
    var wealthy = new Discord.RichEmbed();
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'b3'
    });


    connection.connect();

    connection.query('select name, id from b3.clients where name REGEXP ?', name, function(error, nameresults, fields) {
        if (error) _channel.send(error);
        var nameresults = [];
        var idresults = [];
        for (var i = 0; i < nameresults.length; i++) {
            nameresults.push(results[i].name);
            idresults.push(results[i].id);
                 }

        if (nameresults.length == 0) {

          wealthy.setTitle(':mag: __No Results Found__');
          wealthy.setColor('BLUE');
          _channel.sendEmbed(wealthy);
          return;
      }

        wealthy.setTitle(':mag: ' + 'Player Lookup');
        wealthy.addField('__Name__', nameresults.join('\n'), true);
        wealthy.addField('__ID__', idresults.join('\n'), true);
        wealthy.setColor(0xff0000);
        _channel.sendEmbed(wealthy);
    });
    connection.end();
}

function botinfo() {
  var wealthy = new Discord.RichEmbed();
    wealthy.setTitle(':information_source: Sunbae Bot v1.0');
    wealthy.setDescription('***Changelog***:\n*Nothing to see here, we\'re on v1.0.*')
    wealthy.setFooter('Coded by Aliex -- Version Patch 09/16/2017')

    wealthy.setColor(0xff0000);
    _channel.sendEmbed(wealthy);
};
