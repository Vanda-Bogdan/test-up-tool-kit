const { execSync } = require('child_process');
const YAML = require('yaml')
const fs = require('fs');
const { executeCommand, executeCommandWithResult} = require('./functions')
const { parse, stringify } = require('envfile')
require('dotenv').config()

const readline = require("readline"); 
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, }); 
let name = ''
let token = ''
let folderName = "testup";
let networkName = '';
let oldEnvValue = '';

const readConsole = async (text) => { 
    console.log(text);
    const it = rl[Symbol.asyncIterator]();
    const line1 = await it.next() ;
    return line1.value;
}; 

async function composeUp() {

    createFolder(folderName);
    let pathToDocComp = await readConsole('Specify the path of docker-compose.yml: ');
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

async function updateENV(){
    try {
        if (fs.existsSync(".env")) {
            let containerName = process.env.DB_CONTAINER_NAME + '_' + token;
            await executeCommandWithResult(`docker ps -aqf "name=${containerName}"`).then((containerID) => {
                containerID = containerID.replace(/\s/g, "")
                executeCommandWithResult(`docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerID}`).then((response) => {
                    response = response.replace(/\s/g, "");
                    let data = fs.readFileSync(".env", "utf8");
                    let ENV = parse(data);
                    oldEnvValue = ENV.DB_HOST;
                    ENV.DB_HOST = response;
                    fs.writeFileSync('.env', stringify(ENV));
                });
            });
        }
        else{
            console.log('Error: .env file is required!')
            process.exit();
        }
      } catch (err) {
        console.error(err);
        process.exit();
      }
}

async function rollbackENV(){
    try {
        if (fs.existsSync(".env")) {
            let data = fs.readFileSync(".env", "utf8");
            let ENV = parse(data);
            ENV.DB_HOST = oldEnvValue;
            fs.writeFileSync('.env', stringify(ENV));
        }
        else{
            console.log('Error: .env file is required!')
            process.exit();
        }
      } catch (err) {
        console.error(err);
        process.exit();
      }
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
        console.log('Check Docker is running');
        return true;
    } 
    catch (e) {
        console.log('Docker is NOT running');
        process.exit();
    }
}

async function setJestConfig(){
    try {
        if (fs.existsSync("jest.config.json")) {
            let data = fs.readFileSync("jest.config.json", "utf8");
            let obj = JSON.parse(data);
            if(JSON.stringify(obj["reporters"])=='["default",["./node_modules/jest-html-reporter",{"pageTitle":"Test Report"}]]'){
                return;
            }
            if(!Array.isArray(obj["reporters"])){
                obj["reporters"] = [obj["reporters"]];
            }
            obj["reporters"].push( ["default", ["./node_modules/jest-html-reporter", {"pageTitle": "Test Report"}]] );
            fs.writeFileSync('jest.config.json', JSON.stringify(obj));
        }
        else{
            fs.writeFileSync('jest.config.json', '{"reporters": ["default",["./node_modules/jest-html-reporter", {"pageTitle": "Test Report"}]]}');
        }
      } catch (err) {
        console.error(err);
      }
}



function checkGitExists() {
    try {
        execSync('git --version', {stdio : 'pipe' });
        console.log('Check Git is installed');
        return true;
    } 
    catch (e) {
        console.log('Git is NOT installed');
        process.exit();
    }
}

function checkGitSet(){
    try {
        execSync('git status', {stdio : 'pipe' });
        console.log('Check Git repository exists');
        return true;
    } 
    catch (e) {
        console.log('Git repository NOT found');
        process.exit();
    }
}

async function start(){
    //await checkInitialDependencies();
    token = Math.random().toString().substring(2,6)
    await composeUp();
    await updateENV();
    await setJestConfig();
    await packNode();
    await rollbackENV();
    await finalActions();
    process.exit();
}

async function finalActions(){
    var info = {nodeContainerName:`node_project${token}`, token: token, folderName: folderName}
    fs.writeFileSync('./node_modules/test-up-tool-kit/config.json', JSON.stringify(info));
}

start();