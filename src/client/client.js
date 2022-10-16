// Get net module
const net = require('net');
require('dotenv').config({path: '../../.env'})
const readline = require('readline');
const yargs = require('yargs');

/**
 * We Use yargs library to handle projet argument and specify username at each connection
 * command to start project : node client.js add --name="david"
 * NB : name could be soro, pierre and other else
 */
const username = yargs.argv.name !== undefined ? yargs.argv.name : 'soro';



/**
 * We use readline to instead of `process.stdin` as suggest in the exercice
 */
const interface = readline.createInterface(
    process.stdin, process.stdout);

const client = new net.Socket();

client.connect(process.env.PORT,async function(){
    // Log when the connection is established
    console.log(`Client is connected to server on port ${process.env.PORT}`);
    // 1. Send message after connection establishment
    client.write(
        JSON.stringify({
            messageFormat: {from: username ,action:'client-hello', msg: 'First connection'},
            comment: "Message sent as soon as the connection is successfully",
            type: "Client request"}, null, 2));

});

//Handle data coming from the server
client.on('data',function(data){
    console.log(`data received from server : ${data}`);

    interface.question('What action do you want to do ? \n1. Send private message\n2. Send broadcast message \n3. List connected users\n4. Quit\n>>> ', (answer) => {
        /**
         * Triggered an action according what the user want to do on the server
         * 1. Send Private message
         * 2. Send broadCast message
         * 3. List connected users
         * 4. Quit server properly
         */
        switch(+answer){
            case 1:
                sendPrivateMessage(client, username);
                break;
            case 2:
                sendBroadcastMessage(client, username);
                break;
            case 3:
                listConnectedUser(client, username);
                break;
            case 4:
                quit(client, username);
                break;
        }
        // interface.close();
    });

});

// Handle connection close
client.on('close',function(){
    console.log('connection Closed');
});
//Handle error
client.on('error',function(error){
    console.error(`Connection Error ${error}`);
});

/**
 * Send a private message to a specific user
 */
function sendPrivateMessage(client, username) {
    interface.setPrompt(`Message to be sent : `);
    interface.prompt();
    interface.on('line', (msg) => {
        const sender = username ;
        const receiver = 'kaz';
        client.write(
            JSON.stringify({
                messageFormat: {from: sender, to: receiver, action:'client-send', msg},
                comment: `${sender} envoie le message '${msg}' à ${receiver}`,
                type: "Client request"}, null, 2));
    })
}

/**
 * Send a broadcast message to all user
 */
function sendBroadcastMessage(client, username) {
    interface.setPrompt(`Message to be sent: `);
    interface.prompt();
    interface.on('line', (msg) => {
        const sender = username ;
        client.write(
            JSON.stringify({
                messageFormat: {from: username, action:'client-broadcast', msg},
                comment: `${sender} envoie le message '${msg}'`,
                type: "Client request"}, null, 2));
    })
}

/**
 * List all connected user
 */
function listConnectedUser(client, username) {
    const sender = username;
    client.write(
        JSON.stringify({
            messageFormat: {from: sender, action:'client-list-clients'},
            comment: `${sender} demande la liste des utilisateurs connecté`,
            type: "Client request"}, null, 2));
}

/**
 * command to allow usr to quit
 */
function quit(client, username) {
    const sender = username !== undefined ? username : 'SORO' ;
    client.write(
        JSON.stringify({
            messageFormat: {from: sender, action:'client-quit'},
            comment: `${sender} quitte le server`,
            type: "Client request"}, null, 2));
}
