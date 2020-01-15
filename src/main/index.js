import { ipcMain,electron,app, BrowserWindow,dialog  } from 'electron'
const fs = require('fs-extra')
const path = require('path')
const request = require('request');
const formData = require('form-data');
const axios = require('axios');
const fetch = require('node-fetch');
const Multipart = require('multi-part');
const http = require('http');
const isOnline = require('is-online');
const { autoUpdater } = require('electron-updater');


import DEV_ENV from '../dev.env';
import PROD_ENV from '../prod.env';
global.ENV = DEV_ENV;

if (process.env.NODE_ENV === 'production') {

  Object.assign(global.ENV, PROD_ENV);
}


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      webSecurity: false
    }
  })
  //mainWindow.webContents.openDevTools()

  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })



}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

let apiUrl = global.ENV.apiUrl

ipcMain.on('saveInfraction',async (event,data)=>{


    try
    {
      let infraction = data.infraction;
      let token = data.token;
      let basepath = `${path.dirname(path.dirname(infraction["capture_2"]["path"]))}/infracciones`;

      let equipmentNumber = basepath.match(/equipo-(\d{1,})/)[1];
      let year = basepath.match(/año-([0-9]{1,})/)[1];
      let month = basepath.match(/mes-([0-9]{1,2})/)[1];
      let day = basepath.match(/dia-([0-9]{1,2})/)[1];

      if(!(await fs.exists(basepath)))
      {
        await fs.mkdir(basepath, { recursive: true });
      }

      let timeName =  infraction.time.replace(/:/g,"").trim();
      infraction.plate = !infraction.unreadablePlate ? infraction.plate.toUpperCase().trim() : 'XXX000';

      await fs.writeFile(`${basepath}/${infraction.plate}-${timeName}-F1-${equipmentNumber}.png`, infraction["capture_1"].replace(/^data:image\/png;base64,/, ""), 'base64');
      await fs.copy(infraction["capture_2"].path,`${basepath}/${infraction.plate}-${timeName}-F2-${equipmentNumber}.png`);
      await fs.copy(infraction["capture_3"].path,`${basepath}/${infraction.plate}-${timeName}-F3-${equipmentNumber}.png`);

      if(!await isOnline())
      {
        return event.sender.send('infractionSaved',{infraction});
      }

      const form = new Multipart();
      form.append('time',infraction.time);
      form.append('plate',infraction.plate);
      form.append('day',day);
      form.append('month',month);
      form.append('year',year);
      form.append('equipment',equipmentNumber);
      form.append('capture_1',fs.readFileSync(`${basepath}/${infraction.plate}-${timeName}-F1-${equipmentNumber}.png`),{filename :`${infraction.plate}-${timeName}-F1-${equipmentNumber}.png`})
      form.append('capture_2',fs.readFileSync(`${basepath}/${infraction.plate}-${timeName}-F2-${equipmentNumber}.png`),{filename :`${infraction.plate}-${timeName}-F2-${equipmentNumber}.png`})
      form.append('capture_3',fs.readFileSync(`${basepath}/${infraction.plate}-${timeName}-F3-${equipmentNumber}.png`),{filename :`${infraction.plate}-${timeName}-F3-${equipmentNumber}.png`})


      let headers = form.getHeaders();
      headers['Authorization'] = `Bearer ${token}`;

      const request_config = {
        method: "post",
        url: `${apiUrl}/capture/user`,
        headers: headers,
        data: form.stream()
      };
      let response = await axios(request_config);
      event.sender.send('infractionSaved',{response,infraction:data.infraction});
    }
    catch(e)
    {
      console.log(e);
      event.sender.send('infractionSaved',{error:e,infraction:data.infraction});
    }



});
ipcMain.on('loadFolder', async (event,pathToLoad) => {

  async function loadFolder(selectedDir) {
    let dirNameRegex = /(^equipo-[0-9]{1,}$)|(^capturas$)|(^año-[0-9]{1,}$)|(^mes-[0-9]{1,2}$)|(^dia-[0-9]{1,2}$)|(^.*\.(mp4|avi)$)/;
    let fileNameRegex = /^[0-9]{1,}\.jpg$/;

    let dirContent = (await fs.readdir(selectedDir))
    .map((element,key)=>{
      let currentPath = `${selectedDir}/${element}`;
      let lstat = fs.lstatSync(currentPath);
      let name = element.match(/(^.*\.(mp4|avi)$)/) ? `${key + 1}` : element;
      return {path:currentPath,folderName:element,name:name,type:lstat.isDirectory()?'folder':'file'};
    })
    .filter((element)=>{
      let parentDirName = path.basename(path.dirname(element.path));
      return element.type == 'folder' && element.folderName.match(dirNameRegex) || element.type == 'file' && element.folderName.match(fileNameRegex);
    })
    .sort((a, b)=>{return parseInt(a.name.replace(/[^0-9\.]+/g,""))-parseInt(b.name.replace(/[^0-9\.]+/g,""))});

    return dirContent;
  }

  if(!pathToLoad)
  {
    //https://www.christianengvall.se/electron-showopendialog-tutorial/
    dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    },async (filePaths) => {
      let selectedDir = filePaths[0];
      event.sender.send('folderLoaded', {children:await loadFolder(selectedDir),parent:{name:path.basename(selectedDir),path:selectedDir}});
    });
  }
  else
  {
    event.sender.send('folderLoaded', {children:await loadFolder(pathToLoad),parent:{name:path.basename(pathToLoad),path:pathToLoad}});
  }


});


ipcMain.on('check_updates',(event)=>{

  //Update manager
  autoUpdater.checkForUpdatesAndNotify();


  autoUpdater.on('update-available', () => {
     event.sender.send('update_available');
  });
  autoUpdater.on('update-downloaded', () => {
     event.sender.send('update_downloaded');
  });

});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */


/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})

*/
