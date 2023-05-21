const { execSync } = require('child_process');
const fs = require('fs');

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

async function executeCommandWithResult(command){
    try {
        return execSync(command).toString();
    } 
    catch (e) {
        console.log(e)
        return false;
    }
}

async function checkDockerRunning() {
    try {
        execSync('docker ps', {stdio : 'pipe' });
        return true;
    } 
    catch (e) {
        console.log('ERROR: Docker is NOT running!');
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

module.exports = {
    executeCommand,
    executeCommandWithResult,
    checkDockerRunning,
    createFolder
};