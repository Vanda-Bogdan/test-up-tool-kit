const fs = require('fs');
const { executeCommand, executeCommandWithResult} = require('./functions')

async function start(){
    let nodeContainerID = null;
    let config = JSON.parse(fs.readFileSync('./node_modules/test-up-tool-kit/config.json'))
    let nodeContainerName = config['nodeContainerName'];
    let folderName = config['folderName'];
    await executeCommandWithResult(`docker ps -aqf "name=${nodeContainerName}"`).then((response) => {
        nodeContainerID = response.replace(/\s/g, "")
        executeCommand(`docker exec ${nodeContainerID} npm run test`);
    });
    await executeCommand(`docker cp ${nodeContainerID}:/usr/src/app/test-report.html ./${folderName}/test-report.html`);
}

start();