// import module
const net = require('net');
require('dotenv').config({path: '../../.env'})

// Create an instance of the server
const server = net.createServer(handleConnection);
// We create a socket array to store all socket connection
let sockets = [];
const clients = new Map();


// Start listening on PORT
server.listen(process.env.PORT,process.env.HOST ,function(){
    console.log(`Server is running on ${process.env.HOST}:${process.env.PORT}`);
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

        console.log("Action to be perform", socket.address());

        // prepare and send a response to the client
        switch(action){
            case 'client-hello':
                socket.write(JSON.stringify({
                    messageFormat: {from: sender_name,action:'server-hello',  msg: message_content},
                    comment: `Acknowledge the connection of the client '${sender_name}' with a welcome message '${message_content}'`,
                    type: "Server response"}, null, 2))
                break;

            case 'client-send':
                socket.write(JSON.stringify({
                    messageFormat: { from: sender_name,action:'server-private',  msg: message_content},
                    comment: `Received private message form '${sender_name}' to ${receiver_name} with message '${message_content}'`,
                    type: "Server response"}, null, 2))
                break;

            case 'client-broadcast':
                // In order to send broadcast message we are going to loop over all sockets store store
                // And send a message to each one
                sockets.forEach(socket => {
                    socket.write(JSON.stringify({
                        messageFormat: { from: sender_name,action:'server-broadcast', msg: message_content},
                        comment: `Received broadcast message form '${sender_name}' with message '${message_content}'`,
                        type: "Server response"}, null, 2))

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
                    type: "Server response"}, null, 2))
                break;
            case 'client-quit':
                socket.write(JSON.stringify({
                    messageFormat: { from: sender_name,action:'server-broadcast'},
                    comment: `'${sender_name}' quit successfully the server`,
                    type: "Server response"}, null, 2));
                // We delete client socket from sockets array
                const index = sockets.indexOf(socket);
                sockets.splice(index, 1);
                // We remove client from client list
                clients.get(sender_name);
                clients.delete(sender_name);
                break;
        }


        // close the connection
        // socket.end()
    });

    // Handle when client connection is closed
    socket.on('close',function(){
        console.log(`${socket.remoteAddress}:${socket.remotePort} Connection closed`);
    });

    // Handle Client connection error.
    socket.on('error',function(error){
        console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`);
    });
};