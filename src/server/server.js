// import module
const net = require('net');
const {SERVER_RESPONSE, NOTIFICATION} = require('../../src/message-types');

// Create an instance of the server
const server = net.createServer(handleConnection);
// We create a socket array to store all socket connection
let sockets = [];
const clients = new Map();

const port = process.env.PORT  || 8080
const host = process.env.HOST  || '127.0.0.1'

// Start listening on PORT
server.listen(port, host, function(){
    console.log(`Server is running on ${host}:${port}`);
});


// the client handling callback
function handleConnection(socket){
    // We add new client connected socket to the sokets array
    sockets.push(socket);

    // Log when a client connects.
    console.log(`New client connection from ${socket.remoteAddress}:${socket.remotePort}`);

    // Handle the client data.
    socket.on('data',function(data){
        // Log data received from the client
        console.log(`>> data received : ${data} `);

        const msg = JSON.parse(data);
        const sender_name = msg.messageFormat.from;
        const receiver_name = msg.messageFormat.to;
        const message_content = msg.messageFormat.msg;
        const action = msg.messageFormat.action;

        // We add new client to client list
        clients.set(sender_name, socket);

        // prepare and send a response to the client
        switch(action){
            case 'client-hello':
                // send message to the connected client
                socket.write(JSON.stringify({
                    messageFormat: {from: sender_name,action:'server-hello',  msg: message_content},
                    comment: `Acknowledge the connection of the client '${sender_name}' with a welcome message '${message_content}'`,
                    type: SERVER_RESPONSE}, null, 2))
                // notify other clients
                const otherUsers = sockets.filter(other => other !== socket);
                otherUsers.forEach(otherUser => {
                    otherUser.write(JSON.stringify({
                        notification: `${sender_name} is connected`,
                        type: NOTIFICATION}, null, 2))
                });
                break;

            case 'client-send':
                // when receiver is not connected
                if (!clients.has(receiver_name)) {
                    console.log(`THE RECEIVER IS NOT CONNECTED`);
                    socket.write(JSON.stringify({
                        messageFormat: { from: sender_name,action:'server-private',  msg: message_content},
                        comment: `Message not sent because receiver ${receiver_name} is not connected`,
                        type: SERVER_RESPONSE}, null, 2))
                } else {
                    // send server response to sender
                    socket.write(JSON.stringify({
                        messageFormat: { from: sender_name,action:'server-private',  msg: message_content},
                        comment: `your message has been sent successfully  to ${receiver_name} with message '${message_content}'`,
                        type: SERVER_RESPONSE}, null, 2))
                    // send private message to client
                    console.log(`THE RECEIVER IS ${receiver_name}`);
                    const receiverSocket = clients.get(receiver_name);
                    receiverSocket.write(JSON.stringify({
                        messageFormat: { from: sender_name,action:'server-private',  msg: message_content},
                        comment: `You have received a private message from '${sender_name}': '${message_content}'`,
                        type: SERVER_RESPONSE}, null, 2))
                }
                break;

            case 'client-broadcast':
                // In order to send broadcast message we are going to loop over all sockets store
                // And send a message to each one
                sockets.forEach(user => {
                    user.write(JSON.stringify({
                        messageFormat: { from: sender_name,action:'server-broadcast', msg: message_content},
                        comment: `Received broadcast message from '${sender_name}' with message '${message_content}'`,
                        type: SERVER_RESPONSE}, null, 2))

                });
                break;
            case 'client-list-clients':
                // List all connected user
                let connectedUser = [];
                for (const client of clients.keys()) {
                    connectedUser.push(client);
                }
                // send users list to client
                socket.write(JSON.stringify({
                    messageFormat: { from: sender_name,action:'client-list-clients', users: connectedUser},
                    comment: `List of connected user`,
                    type: SERVER_RESPONSE}, null, 2))
                break;
            case 'client-quit':
                socket.write(JSON.stringify({
                    messageFormat: { from: sender_name,action:'server-quit'},
                    comment: `'${sender_name}' quit successfully the server`,
                    type: SERVER_RESPONSE}, null, 2));
                // We delete client socket from sockets array
                const index = sockets.indexOf(socket);
                sockets.splice(index, 1);
                // We remove client from client list
                clients.get(sender_name);
                clients.delete(sender_name);
                // notify other clients
                const otherClients = sockets.filter(other => other !== socket);
                otherClients.forEach(otherClient => {
                    otherClient.write(JSON.stringify({
                        notification: `${sender_name} has quit the server`,
                        type: NOTIFICATION }, null, 2))
                });
                // close the connection
                socket.end()
                break;
        }



    });

    // Handle when client connection is closed
    socket.on('close',function(){
        console.log(`${socket.remoteAddress}:${socket.remotePort} Connection closed`);
    });

    // Handle Client connection error.
    socket.on('error',function(error){
        console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`);
    });
}