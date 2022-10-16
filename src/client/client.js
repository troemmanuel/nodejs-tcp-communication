// Get net module
const net = require('net');
const yargs = require('yargs');
const commandes = require('../../src/commandes');

/**
 * We Use yargs library to handle projet argument and specify username at each connection
 * command to start project : node client.js add --name="david"
 * NB : name could be soro, pierre and other else
 */
const username = yargs.argv.name !== undefined ? yargs.argv.name : process.env.USERNAME;


const client = new net.Socket();
const port = process.env.PORT || 8080
const host = process.env.HOST || '127.0.0.1'

client.connect(port, host, function(){
    // Log when the connection is established
    console.log(`Client is connected to server on  ${host}:${port}`);
    // 1. Send message after connection establishment
    client.write(
        JSON.stringify({
            messageFormat: {from: username ,action:'client-hello', msg: 'First connection'},
            comment: "Message sent as soon as the connection is successfully",
            type: "Client request"}, null, 2));

});

//Handle data coming from the server
client.on('data',async function(data){
    console.log(`data received from server : ${data}`);
    console.log(`=============  MENU ==================`);
    console.log(`======================================`);
    console.log(`======================================`);
    console.log(`======================================`);
    console.log(`======================================`);
    console.log(`======================================`);

    // handle commande
    commandes.handleCommande(client,username);
});

// Handle connection close
client.on('close',function(){
    console.log('connection Closed');
});
//Handle error
client.on('error',function(error){
    console.error(`Connection Error ${error}`);
});
