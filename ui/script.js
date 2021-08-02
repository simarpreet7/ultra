//https://www.youtube.com/watch?v=Ytu5yXHhiVc
//C:\Users\VORTON\OneDrive\Desktop\optum\work\tests
//C:\Users\VORTON\OneDrive\Desktop\optum\work\input.txt
//[20:35] Dasgupta, Atarpan
//https://www.youtube.com/watch?v=3yqDxhR2XxE
//bulma.io
const {app,BrowserWindow,Menu,ipcMain} = require('electron')
const cmd=require('node-cmd');
ipcMain.on('search',(event,data)=>{
    let cmdStr='cd .. && node final '+data.file+" "+data.input
    console.log(cmdStr)
    cmd.run(cmdStr,
        function(err, logs, stderr){
            console.log(logs)
            event.reply('logs',{logs:logs})
        }
    );
})
function createWindow(){
    const window=new BrowserWindow({
        width:800,
        height:600,
        title:"ultra search",
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false
        }
    })
    window.loadFile('index.html')
    window.webContents.openDevTools();
}
app.whenReady().then(createWindow)