const { execSync } = require('child_process');

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

module.exports = {
    executeCommand,
    executeCommandWithResult
};