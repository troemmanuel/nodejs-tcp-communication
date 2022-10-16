const {CLIENT_REQUEST} = require('../src/message-types');
const readline = require('readline');

// initialise readline
const editor = readline.createInterface(process.stdin, process.stdout);

/**
 * Send a private message to a specific user from client
 */
exports.send =function (client, username) {
    editor.question('Receiver:', (name) => {
        console.log('YOU WILL SEND A MESSAGE TO ' + name);
        const receiver = name;
        editor.setPrompt(`Message to be sent : `);
        editor.prompt();
        editor.on('line', (msg) => {
            client.write(
                JSON.stringify({
                    messageFormat: {from: username, to: receiver, action:'client-send', msg},
                    comment: `${username} envoie le message '${msg}' à ${receiver}`,
                    type: CLIENT_REQUEST}, null, 2));
        })
    });
}

/**
 * Send a broadcast message to all user
 */
exports.broadcast  = function (client, username) {
    editor.setPrompt(`Message to be sent: `);
    editor.prompt();
    editor.on('line', (msg) => {
        client.write(
            JSON.stringify({
                messageFormat: {from: username, action:'client-broadcast', msg},
                comment: `${username} envoie le message '${msg}'`,
                type: CLIENT_REQUEST}, null, 2));
    })
}

/**
 * List all connected user
 */
exports.list = function(client, username) {
    client.write(
        JSON.stringify({
            messageFormat: {from: username, action:'client-list-clients'},
            comment: `${username} demande la liste des utilisateurs connecté`,
            type: CLIENT_REQUEST}, null, 2));
}

/**
 * Quit server properly
 */
exports.quit = function (client, username) {
    client.write(
        JSON.stringify({
            messageFormat: {from: username, action:'client-quit'},
            comment: `${username} quitte le server`,
            type: CLIENT_REQUEST}, null, 2));
}