const { Logger } = require("nexe/lib/logger");
const {parentPort} = require("worker_threads");
var fs=require("fs")
var logger = fs.createWriteStream("output.txt", {
    flags: 'w'
})
var i=0;
parentPort.on("message", data => {
 if (data.end === true) {
     process.exit(0);
      }
  logger.write(data.write,()=>{
    ++i;
    parentPort.postMessage({data:i})
  });

});
// logger.on('finish',()=>{
//     process.exit(0);
// })

