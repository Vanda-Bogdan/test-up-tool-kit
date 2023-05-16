const { execSync } = require('child_process');
const YAML = require('yaml')
const fs = require('fs');
const { executeCommand, executeCommandWithResult} = require('./functions')

const readline = require("readline"); 
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, }); 
let name = ''
let token = ''
let folderName = "testup";
let networkName = '';

const readConsole = async () => { 
    console.log('Specify the path of docker-compose.yml: ');
    const it = rl[Symbol.asyncIterator]();
    const line1 = await it.next() ;
    return line1.value;
}; 

async function composeUp() {

    createFolder(folderName);
    let pathToDocComp = await readConsole();
    let file = fs.readFileSync(pathToDocComp, 'utf-8') 
    
    let doc = YAML.parseDocument(file)
    
    doc.get('services').items.forEach(element => {      
        element.key.value = element.key.value + '_' + token.toString();
        element.key.source = element.key.source + '_' + token.toString();
        element.value.items.forEach(element => {         
            if(element.key.value==='container_name'){
                element.value.value = element.value.value + '_' + token.toString();
            }
            if(element.key.value==='ports'){
                element.value.items = '';
            }
        });
    });
    
    fs.writeFileSync('./' + folderName + '/docker-compose.yml', doc.toString());

    name = folderName.toLowerCase() + token
    networkName = name + '_default';

    console.log('building compose...');
    await executeCommand(`docker compose -f ./${folderName}/docker-compose.yml -p=${name} up -d`);
}

async function packNode(){
    console.log('packing node project to container...');
    fs.writeFileSync('./' + folderName + '/.dockerignore', "node_modules\nnpm-debug.log");

    let dockerfile_inner = 'FROM node:18.0.0\nWORKDIR /usr/src/app\n' + 
    'COPY package*.json ./\nRUN npm install\nCOPY . .\nENTRYPOINT ["tail", "-f", "/dev/null"]';
    fs.writeFileSync('./' + folderName + '/Dockerfile', dockerfile_inner);

    await executeCommand('cd ..');

    console.log('1/3 building image...');
    await executeCommand(`docker build . -t node_project_image${token} -f ${folderName}/Dockerfile`);

    console.log('2/3 running image...');
    await executeCommand(`docker run -d --name node_project${token} node_project_image${token}`);

    console.log('3/3 connecting container to network...')
    await executeCommandWithResult(`docker ps -aqf "name=node_project${token}"`).then((response) => {
        response = response.replace(/\s/g, "")
        executeCommand(`docker network connect ${networkName} ${response}`);
    });

    console.log('Done!')
}
 
async function createFolder(name){
    try {
        if (!fs.existsSync(name)) {
          fs.mkdirSync(name);
        }
      } catch (err) {
        console.error(err);
      }
}

async function checkInitialDependencies(){
    await checkDockerRunning();
    //checkGitExists();
    //checkGitSet();
}

async function checkDockerRunning() {
    try {
        execSync('docker ps', {stdio : 'pipe' });
        console.log('Докер функционирует');
        return true;
    } 
    catch (e) {
        console.log('Докер НЕ функционирует');
        return false;
    }
}

async function setJestConfig(){

}

function checkGitExists() {
    try {
        execSync('git --version', {stdio : 'pipe' });
        console.log('Git установлен');
        return true;
    } 
    catch (e) {
        console.log('Git НЕ установлен');
        return false;
    }
}

function checkGitSet(){
    try {
        execSync('git status', {stdio : 'pipe' });
        console.log('Git репозиторий найден');
        return true;
    } 
    catch (e) {
        console.log('Git репозиторий НЕ найден');
        return false;
    }
}

async function start(){
    //await checkInitialDependencies();
    token = Math.random().toString().substring(2,6)
    await composeUp();
    await packNode();
    await finalActions();
    process.exit();
}

async function finalActions(){
    var info = {nodeContainerName:`node_project${token}`, token: token, folderName: folderName}
    fs.writeFileSync('./node_modules/test-up-tool-kit/config.json', JSON.stringify(info));
}

start();