const fs = require('fs');
const _=require("lodash")
const dirTree = require("directory-tree");
const IntialFile=process.argv[2]; //filename
const keywordFile=process.argv[3]; //
const OutputFile=process.argv[4];
let result=[];
async function search(tree,keyword){
    if(_.isEmpty(tree)){
           return result;
    }
    tree.children.forEach(async (data) => {
        if(data.type=="file"){
            let file = fs.readFileSync(data.path, "utf8");
            let arr = file.split(/\r?\n/);
            arr.forEach((line, idx)=> {
                if(line.includes(keyword)){
                result.push({data:{path:data.path,line:(idx+1),value:line},keyword:keyword});
                }
            });

        }
        else if(data.type=="directory"){
            if(_.isEmpty(data.children)){

            }
            else{   
             search(data,keyword)   
            }
        }
        else{

        }
    });
    
}
// async function divider(tree){
//             console.log(1)
//             const readInterface = readline.createInterface({
//                 input: fs.createReadStream(keywordFile),
//                 // output: process.stdout,
//                 console: false
//             });
//             console.log(2)
//             readInterface.on('line', async function(keyword) {
//                 search(tree,keyword);
//                 console.log("wow")
//             },()=>{console.log("here")});
//             console.log(3)
// }
async function runner(){
    let words=[];
    let startdate=Date.now();
    let tree = dirTree(IntialFile);
    fs.readFileSync(keywordFile, 'utf-8').split(/\r?\n/).forEach(function(line){
        let word=line.split(" ");
        words.push({keyword:word[0],operation:word[1],changer:word[2]})
        search(tree,word[0]);
    })   
    // console.log(result)
    let write=""


      // for(let j=0;j<words.length;++j){
        write+="searched text | filePath | line number | text  "
        write+="\n";
        for(let i=0;i<result.length;++i){ 
              write+=result[i].keyword+" | "  
              write+=result[i].data.path+" | "
              write+=result[i].data.line+" | "
              write+=result[i].data.value+" | "
              write+="\n"
              fs.writeFileSync(OutputFile, write);
              write="";
            
        }  
      //}
    // fs.writeFileSync(OutputFile, write);
    console.log(result.length+ " lines added in "+((Date.now()-startdate)/1000)+ " seconds")
}
runner();