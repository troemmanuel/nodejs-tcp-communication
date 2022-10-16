const flag = process.env.DEBUG || true;
exports.LOG = function (...args){
    if(flag === true){
        console.log(args.join());
    }
}