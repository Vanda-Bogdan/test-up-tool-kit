const { exec } = require('child_process');
const { execSync } = require('child_process');
const { spawnSync } = require("child_process");
const YAML = require('yaml')
const fs = require('fs');

// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
// })


const readline = require("readline"); 
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, }); 
let name = ''

const readConsole = async () => { 
    console.log('Укажите путь к файлу docker-compose.yml: ');
    const it = rl[Symbol.asyncIterator]();
    const line1 = await it.next() ;
    console.log(line1); 
}; 



async function buildYML() {

    await readConsole();
    let file = fs.readFileSync('D:/Study/Diplom/node_project/docker-compose2.yml', 'utf-8') //D:/Study/Diplom/node_project/docker-compose.yml
    //console.log(file)
    //let parsed = YAML.parse(file)
    let doc = YAML.parseDocument(file)
    //console.log(doc.get('services').toString())
    doc.addIn(['services'], 'testing');
    console.log(doc.get('services').toString())
    fs.writeFileSync('D:/Study/Diplom/node_project/docker-compose2.yml', doc.toString());

}




function checkInitialDependencies(){
    checkDockerRunning();
    checkGitExists();
    checkGitSet();
}

function checkDockerRunning() {
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


//checkInitialDependencies();
buildYML(); 

//process.exit();