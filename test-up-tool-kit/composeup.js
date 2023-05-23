const { execSync } = require('child_process');
const YAML = require('yaml')
const fs = require('fs');
const { createFolder, checkDockerRunning, executeCommand, executeCommandWithResult} = require('./functions')
const { parse, stringify } = require('envfile')
require('dotenv').config()

const readline = require("readline"); 
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, }); 
let name, token, networkName;
let folderName = "testup";

const readConsole = async (text) => { 
    console.log(text);
    const it = rl[Symbol.asyncIterator]();
    const line1 = await it.next() ;
    return line1.value;
}; 

async function composeUp() {

    checkDockerRunning();
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
    await createToken();
    await composeUp();
    await setJestConfig();
    await updateConfig();
    console.log('Compose Up - Done!');
    process.exit();
}

async function createToken(){
    token = Math.random().toString().substring(2,6)
}

async function updateConfig(){
    let config = JSON.parse(fs.readFileSync('./node_modules/test-up-tool-kit/config.json'))
    config["nodeContainerName"] = `node_project${token}`;
    config["token"] = token;
    config["folderName"] = folderName;
    config["networkName"] = networkName;
    fs.writeFileSync('./node_modules/test-up-tool-kit/config.json', JSON.stringify(config));
}

start();