const fs = require('fs');
const { executeCommand, executeCommandWithResult} = require('./functions')
const path = require('path')

async function start(){
    console.log('running tests...')
    let nodeContainerID = null;
    let config = JSON.parse(fs.readFileSync('./node_modules/test-up-tool-kit/config.json'))
    let nodeContainerName = config['nodeContainerName'];
    let folderName = config['folderName'];
    await executeCommandWithResult(`docker ps -aqf "name=${nodeContainerName}"`).then((response) => {
        nodeContainerID = response.replace(/\s/g, "")
        executeCommand(`docker exec ${nodeContainerID} npm run test`);
    });
    await executeCommand(`docker cp ${nodeContainerID}:/usr/src/app/test-report.html ./${folderName}/test-report.html`);

    console.log('Runnig tests - Done!')
    let pathTO = path.join(process.cwd(), `${folderName}/test-report.html`)
    console.log(`Check report file: ${pathTO}`)
    process.exit();
}

start();