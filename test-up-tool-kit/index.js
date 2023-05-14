const { execSync } = require('child_process');
const YAML = require('yaml')
const fs = require('fs');

const readline = require("readline"); 
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, }); 
let name = ''
let token = ''
let folderName = "testUp";
let networkName = '';

const readConsole = async () => { 
    console.log('Укажите путь к файлу docker-compose.yml: ');
    const it = rl[Symbol.asyncIterator]();
    const line1 = await it.next() ;
    //console.log(line1); 
    return line1.value;
}; 

async function composeUp() {

    createFolder(folderName);
    let pathToDocComp = await readConsole();
    let file = fs.readFileSync(pathToDocComp, 'utf-8') 
    
    let doc = YAML.parseDocument(file)
    
    fs.writeFileSync('./' + folderName + '/docker-compose.yml', doc.toString());

    await executeCommand('cd ./' + folderName);

    token = Math.random().toString().substring(2,6)
    name = folderName.toLowerCase() + token
    networkName = name + '_default';

    await executeCommand(`docker compose -p=${name} up -d`);
    
    console.log('up!');
}

async function packNode(){
    console.log('packing...');
    fs.writeFileSync('./' + folderName + '/.dockerignore', "node_modules\nnpm-debug.log");

    let dockerfile_inner = 'FROM node:18.0.0\nWORKDIR /usr/src/app\n' + 
    'COPY package*.json ./\nRUN npm install\nCOPY . .\nENTRYPOINT ["tail", "-f", "/dev/null"]';
    fs.writeFileSync('./' + folderName + '/Dockerfile', dockerfile_inner);
    await executeCommand('cd ..');
    await executeCommand(`docker build . -t node_project${token} -f ${folderName}/Dockerfile`);
    await executeCommand(`docker run node_project${token}`);
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

async function executeCommand(command){
    try {
        execSync(command , {stdio : 'pipe' });
        return true;
    } 
    catch (e) {
        console.log(e)
        return false;
    }
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
    //await composeUp();
    await packNode();
}

start();
//process.exit();

