const readline = require('readline');

const messages = require('../src/messages');

/**
 * We use readline to instead of `process.stdin` as suggest in the exercice
 */
const editor = readline.createInterface(
    process.stdin, process.stdout);


exports.handleCommande = function (client, username){
    editor.question('What command do you want to do ? \ns. Send private message\nb. Send broadcast message \nls. List connected users\nq. Quit\n>>> ', (answer) => {
        /**
         * Triggered an action according what the user want to do on the server
         * s. Send Private message
         * b. Send broadCast message
         * ls. List connected users
         * q. Quit server properly
         */
        switch(answer){
            case 's':
                messages.send(client, username, editor);
                break;
            case 'b':
                messages.broadcast(client, username, editor);
                break;
            case 'ls':
                messages.list(client, username);
                break;
            case 'q':
                messages.quit(client, username);
                break;
        }
    });
}



