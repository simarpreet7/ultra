// 11. (input,file(user able to select only folder)) upload and search service
// 12. bulma or bootstrap
// 6.   callback (ipc=progress bar each keyword)
// 7.   freedom to configure output files, file rolling options etc.
// 8.   Verify search texts in excel pdf + normal pdf.
// 9.   Folder structure for output file. Folder name e.g. 
//      OutputExecution_mmddyyyyHHSS. File name 1[changable]_OutputFile_mmddyyyyHHSS.txt. Need 
//      to include one file named summary which will accumulate texts from console and write.+ cmd + output summary
// 10.  advance UI 


// var os=require("os")
//  process.env.UV_THREADPOOL_SIZE =os.cpus().length
// console.log(os.cpus().length)
const fs = require('fs');
const _ = require("lodash")
const dirTree = require("directory-tree");
const xlsx = require('node-xlsx');
var count = 0;
var total = 0;
var startdate = Date.now();
const IntialFile = process.argv[2]; 
const keywordFile = process.argv[3]; 
// const OutputFile = process.argv[4];

const {Worker} = require("worker_threads");
const worker = new Worker("./worker.js");
worker.on("error", error => {
    console.log(error);
});
worker.on("error", error => {
    console.log(error);
});
worker.on("exit", exitCode => {
    console.log(total + " lines added in " + ((Date.now() - startdate) / 1000) + " seconds")
})  
worker.on("message", result => {
    if(result.data==total){
        cleanup();
    }
});
function cleanup() {
    worker.postMessage({end:true});
}
function adder(write){
    worker.postMessage({write:write,end:false})
}
async function search(tree, keyword) {
    if (_.isEmpty(tree)) {
        return;
    }
    tree.children.forEach(async (data) => {
        if (data.type == "file") {
            if(data.path.split(".")[1]=='xlsx'){//change
                var obj = xlsx.parse(data.path);
                for(var i=0;i<obj.length;++i){
                    for(var j=0;j<obj[i].data.length;++j){
                        if(obj[i].data[j].includes(keyword)){
                            count++;
                            total++;
                            adder(keyword + " | " + data.path+" sheet : "+obj[i].name + " | " + (j + 1) + " | " + obj[i].data[j].join(" ") + "\n");
                        }
                    }
                }
            }
            else if(data.path.split(".")[1]=='pdf'){//change
                // var obj = xlsx.parse(data.path);
                // for(var i=0;i<obj.length;++i){
                //     for(var j=0;j<obj[i].data.length;++j){
                //         if(obj[i].data[j].includes(keyword)){
                //             count++;
                //             total++;
                //             adder(keyword + " | " + data.path+" sheet : "+obj[i].name + " | " + (j + 1) + " | " + obj[i].data[j].join(" ") + "\n");
                //         }
                //     }
                // }
            }
            else{
                let file = fs.readFileSync(data.path, "utf8");
                let arr = file.split(/\r?\n/);
                arr.forEach((line, idx) => {
                if (line.split(' ').includes(keyword)) {
                        count++;
                        total++;
                        adder(keyword + " | " + data.path + " | " + (idx + 1) + " | " + line + "\n");
                    }
                });
            }
       }
       else if (data.type == "directory") {
            if (_.isEmpty(data.children)) {
            }
            else {
            search(data, keyword)
            }
        }
        else {
        }
    });

}

async function runner() {
    adder("searched text | filePath | line number | text  " + "\n")
    total++;
    let tree = dirTree(IntialFile);
    let inputKey = fs.readFileSync(keywordFile, 'utf-8').split(/\r?\n/);
    let uniqueKey =[];
    let previousDate=startdate;
    var indices = [];
    inputKey.filter(function(item, index){
    if(item==""){
        indices.push(1)
    }
    else if(inputKey.indexOf(item) != index){
    indices.push(0)
    }
    else{
    uniqueKey.push(item)
    indices.push(1)
    }
    });
    inputKey.forEach(function (line, idx) {
        if(indices[idx]==0){
            console.log({line:(idx + 1),time:0,error:"cannot search duplicate string"})
            adder('@ error : cannot add duplicate string at line number ' + (idx + 1) + ' in file ' + keywordFile + "|||\n")
            total++;
        }
        else{
            if (line.split(" ")[0] != "") {
                search(tree, line.split(" ")[0]);
                let time =(Date.now()-previousDate)
                console.log({line: (idx + 1),time:time/1000,count: count,word: line.split(" ")[0]});
                previousDate+=time;
                adder("# " + line.split(" ")[0] + " occured " + count + " times|||\n")
                total++;
                count = 0;
            }
            else {
                console.log({line:(idx + 1),time:0,error: "cannot search empty string"})
                adder('@ error : cannot search empty string at line number ' + (idx + 1) + ' in file ' + keywordFile + "|||\n")
                total++;
            }
        }
    })
}
runner()



