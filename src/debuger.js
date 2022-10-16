const chalk = require("chalk");

const flag = process.env.DEBUG || true;
exports.LOG = function (...args){
    if(flag === true){
        console.log(chalk.blue(`LOG (${new Date().toDateString()} ${new Date().getHours()} H ${new Date().getMinutes()} Min ${new Date().getSeconds()} sec) - ${args.join()}`));
    }
}