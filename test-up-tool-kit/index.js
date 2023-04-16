const { exec } = require('child_process');
const { execSync } = require('child_process');
const { spawnSync } = require("child_process");
const YAML = require('yaml')
const fs = require('fs');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})


function buildYML() {

    // readline.question('Укажите путь к файлу docker-compose.yml: ', name => {
      
    //     readline.close();
    //     let file = fs.readFileSync(name, 'utf8')
    //     //console.log(file)
    //     let parsed = YAML.parse(file)
    //     console.log(parsed)
    // });

    const prompt = require('prompt-sync')();

    const name = prompt('What is your name?');
    console.log(`Hey there ${name}`);

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
buildYML() 
process.exit();