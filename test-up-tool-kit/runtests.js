const fs = require('fs');
const { createFolder, checkDockerRunning, executeCommand, executeCommandWithResult} = require('./functions')
const path = require('path')

async function start(){
    console.log('running tests...')
    checkDockerRunning();
    let nodeContainerID = null;
    let config = JSON.parse(fs.readFileSync('./node_modules/test-up-tool-kit/config.json'))
    let nodeContainerName = config['nodeContainerName'];
    let newToken = config['newToken'];;
    let folderName = config['folderName'];
    await executeCommandWithResult(`docker ps -aqf "name=${nodeContainerName}"`).then((response) => {
        nodeContainerID = response.replace(/\s/g, "")
        executeCommand(`docker exec ${nodeContainerID} npm run test`);
    });
    await createFolder(`${folderName}/test-reports`);
    await executeCommand(`docker cp ${nodeContainerID}:/usr/src/app/test-report.html ./${folderName}/test-reports/test-report${newToken}.html`);

    console.log('Runnig tests - Done!')
    let pathTO = path.join(process.cwd(), `${folderName}/test-reports/test-report${newToken}.html`)
    console.log(`Check report file: ${pathTO}`)
    process.exit();
}

start();