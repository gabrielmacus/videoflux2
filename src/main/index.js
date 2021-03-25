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
const mkdirp = require('mkdirp');
const jimp = require('jimp');


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
let loadedPath

async function saveInfractionSequence(equipmentNumber,y,m,d,t,plate,f2_path, f3_path)
{
  let f2_capture_number = parseInt(f2_path.split('/').pop().replace(/\..*/,''));
  let f3_capture_number = parseInt(f3_path.split('/').pop().replace(/\..*/,''));
  let basePath = f2_path.replace(/\/\d+\..*$/,'');
  let videoName  = basePath.match(/\/dia-\d+\/(.*)/)[1]
  //let sequencePath = basePath.replace(/\/equipo-\d+\/año-\d+\/mes-\d+\/dia-\d+\/.*/,'')+`/registro/${y}/${m}/${d}/${videoName}/${plate}/${t}`;
  let sequencePath = basePath.replace(/\/equipo-\d+\/año-\d+\/mes-\d+\/dia-\d+\/.*/,'')+`/registro/${y}-${m}-${d}_${equipmentNumber}`;

  /*
  const form = new Multipart();
  form.append('plate',plate);
  form.append('equipment',equipmentNumber);
  form.append('day',d);
  form.append('month',m);
  form.append('year',y);
  form.append('time',t);*/

  /*
  if(!(await fs.pathExists(sequencePath)))
  {
    await mkdirp(sequencePath);
  }*/

  
  let captureIndex = 0;
  let startNumber = 4;
  async function saveSequenceCapture(i)
  {
    let capturePath = `${basePath}/${i}.jpg`;
    //let image = await jimp.read(capturePath);

    if((await fs.pathExists(capturePath)))
    {
      //image.resize(1280, 720).quality(60).write(`${sequencePath}/${i}.jpg`);
      //await fs.copy(capturePath, `${sequencePath}/${i}.jpg`);
      await fs.copy(capturePath, `${sequencePath}/${plate}-${t}-F${startNumber + captureIndex}-${equipmentNumber}.png`);
      //form.append(`captures`,fs.readFileSync(capturePath));
      captureIndex++;
    }
  }

  let padding = 3;
  for(let i=f2_capture_number-padding;i<f2_capture_number;i++)
  {
    if(i > 0)
    {
      await saveSequenceCapture(i);

    }
  }

  /*
  padding = 4;
  for(let i =f2_capture_number;i<f2_capture_number + padding;i++)
  {
    await saveSequenceCapture(i);

  }*/
  
  
  for(let i =f2_capture_number;i<=f3_capture_number;i++)
  {
    await saveSequenceCapture(i);

  }

  /*
  for(let i=f3_capture_number+1;i <= f3_capture_number + padding;i++)
  {
    await saveSequenceCapture(i);
  }*/

  /*

  let headers = form.getHeaders();
  //headers['Authorization'] = `Bearer ${token}`;

  const request_config = {
    method: "post",
    url: `${apiUrl}/infraction/backup`,
    headers: headers,
    data: form.stream()
  };

  console.log("Uploading backup...")
  let response = await axios(request_config);
  console.log("Backup uploaded.")*/
}

async function uploadInfraction(event, data,max_tries,tries_counter) {

  tries_counter = !tries_counter ? 1 : tries_counter
  try
  {
    console.log("Infraction save try "+tries_counter)

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

    if(!await fs.exists(`${basepath}/${infraction.plate}-${timeName}-F1-${equipmentNumber}.png`))
    {
      await fs.writeFile(`${basepath}/${infraction.plate}-${timeName}-F1-${equipmentNumber}.png`, infraction["capture_1"].replace(/^data:image\/png;base64,/, ""), 'base64');
    }

    if(!await fs.exists(`${basepath}/${infraction.plate}-${timeName}-F2-${equipmentNumber}.png`))
    {
      await fs.copy(infraction["capture_2"].path,`${basepath}/${infraction.plate}-${timeName}-F2-${equipmentNumber}.png`);
    }
    if(!await fs.exists(`${basepath}/${infraction.plate}-${timeName}-F3-${equipmentNumber}.png`))
    {
      await fs.copy(infraction["capture_3"].path,`${basepath}/${infraction.plate}-${timeName}-F3-${equipmentNumber}.png`);
    }

    if(infraction.plate != 'XXX000')
    {
      await saveInfractionSequence(equipmentNumber,year,month,day,timeName,infraction.plate,infraction["capture_2"].path,infraction["capture_3"].path);
    }


    if(!await isOnline())
    {
      return event.sender.send('infractionSaved',{infraction});
    }

    const form = new Multipart();

    form.append('plate',infraction.plate);

    form.append('time',infraction.time);
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

    console.log("Uploading infraction...")

    let response = await axios(request_config);
    event.sender.send('infractionSaved',{response,infraction:data.infraction});
    console.log("Infraction uploaded.")

  }
  catch(e)
  {
    if(tries_counter < max_tries)
    {
      console.log("Error uploading infraction. Retrying...",e)
      tries_counter++
      await uploadInfraction(event,data,max_tries,tries_counter)
    }
    else
    {
      event.sender.send('infractionSaved',{error:e,infraction:data.infraction});
      console.log("Error uploading infraction.",e)
    }




  }



}
async function loadInfractions(path,infractions)
{
  let contents = await fs.readdir(path)
  infractions = !infractions?[]:infractions
  for(const element of contents)
  {
    if(element.match(/(^equipo-[0-9]{1,}$)|(^capturas$)|(^año-[0-9]{1,}$)|(^mes-[0-9]{1,2}$)|(^dia-[0-9]{1,2}$)|infracciones/))
    {
      await loadInfractions(path+"/"+element,infractions)
    }
    else if(element.match(/(.*)-(\d{1,2}\d{1,2}\d{1,2})-F1-(\d{1,3}).png/))
    {
      let match = element.match(/(.*)-(\d{1,2}\d{1,2}\d{1,2})-F1-(\d{1,3}).png/)
      let year = path.match(/año-(\d{4})/)[1]
      let month = path.match(/mes-(\d{1,2})/)[1]
      let date = path.match(/dia-(\d{1,2})/)[1]
      let data= {
        plate:match[1],
        year,
        month,
        date,
        filename:element,
        time:match[2],
        path:path+"/"+element,
        equipment:match[3]
      }

      infractions.push(data)
    }
  }
  return infractions
}

ipcMain.on('saveInfraction',async (event,data)=>{
  uploadInfraction(event, data,3)
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

      loadedPath = selectedDir
    });
  }
  else
  {
    event.sender.send('folderLoaded', {children:await loadFolder(pathToLoad),parent:{name:path.basename(pathToLoad),path:pathToLoad}});
    loadedPath = pathToLoad.replace(/equipo-.*/,'')
  }




});

ipcMain.on('verifyInfractions',async(event,data)=>{

  try {
    let infractions = await loadInfractions(loadedPath)
    let infractionsArr = JSON.parse(JSON.stringify(infractions))
    let batchSize = 50
    let missingInfractions = []

    console.log("Checking missing infractions...")

    while(infractionsArr.length > 0)
    {
      let batchInfractions =  infractionsArr.splice(0,batchSize)

      let headers = {'Authorization':`Bearer ${data.token}`}

      const request_config = {
        method: "post",
        url: `${apiUrl}/infraction/check-infraction-upload`,
        headers: headers,
        data: {infractions:batchInfractions}
      };

      let response = await axios(request_config);
      missingInfractions = missingInfractions.concat(response.data.results)

    }

    console.log("Checked "+infractions.length+" infractions."+missingInfractions.length+" missing infractions.")
    for(const missingInfraction of missingInfractions)
    {
      let png = await fs.readFile(missingInfraction.path);
      // convert binary data to base64 encoded string
      let base64 =  Buffer.from(png).toString('base64');

      let infraction = {
        'infraction':{
          'capture_1':base64,
          'capture_2':{
            'path':missingInfraction.path.replace("F1","F2")
          },
          'capture_3':{
            'path':missingInfraction.path.replace("F1","F3")
          },
          'plate':missingInfraction.plate,
          'time':missingInfraction.time.substr(0,2)+':'+missingInfraction.time.substr(2,2)+':'+missingInfraction.time.substr(4,2)
        },
        'token':data.token

      }

      if(infraction.infraction.plate != 'XXX000')
      {
        await saveInfractionSequence(missingInfraction.equipment,missingInfraction.year,missingInfraction.month,missingInfraction.date,missingInfraction.time,missingInfraction.plate,infraction.infraction["capture_2"].path,infraction.infraction["capture_3"].path);
      }

      await uploadInfraction(event,infraction,3)
    }

    return event.sender.send('infractionsVerified',{success:true});
  }
  catch (e) {
    console.log("ERROR",e)
    return event.sender.send('infractionsVerified',{success:false});
  }


})

import { autoUpdater } from 'electron-updater'

ipcMain.on('check_updates',(event)=>{

  //Update manager
  autoUpdater.checkForUpdates();


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
