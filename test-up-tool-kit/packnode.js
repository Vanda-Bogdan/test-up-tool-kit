const fs = require('fs');
const { checkDockerRunning, executeCommand, executeCommandWithResult} = require('./functions')
const { parse, stringify } = require('envfile')
require('dotenv').config()
const { execSync } = require('child_process');

let oldEnvValue, oldToken, newToken, folderName, networkName;

async function syncInfo(){
    let config = JSON.parse(fs.readFileSync('./node_modules/test-up-tool-kit/config.json'))
    oldToken = config["token"];
    folderName = config["folderName"];
    networkName = config["networkName"];
}

async function createToken(){
    newToken = Math.random().toString().substring(2,6)
}

async function updateENV(){
    try {
        if (fs.existsSync(".env")) {
            let containerName = process.env.DB_CONTAINER_NAME + '_' + oldToken;
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
            console.log('ERROR: .env file is required!')
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
            console.log('ERROR: .env file is required!')
            process.exit();
        }
      } catch (err) {
        console.error(err);
        process.exit();
      }
}

async function packNode(){
    console.log('packing node project to container...');
    checkDockerRunning();
    fs.writeFileSync('./' + folderName + '/.dockerignore', "node_modules\nnpm-debug.log");

    let dockerfile_inner = 'FROM node:18.0.0\nWORKDIR /usr/src/app\n' + 
    'COPY package*.json ./\nRUN npm install\nCOPY . .\nENTRYPOINT ["tail", "-f", "/dev/null"]';
    fs.writeFileSync('./' + folderName + '/Dockerfile', dockerfile_inner);

    await executeCommand('cd ..');

    console.log('1/3 building image...');
    await executeCommand(`docker build . -t node_project_image${newToken} -f ${folderName}/Dockerfile`);

    console.log('2/3 running image...');
    await executeCommand(`docker run -d --name node_project${newToken} node_project_image${newToken}`);

    console.log('3/3 connecting container to network...')
    await executeCommandWithResult(`docker ps -aqf "name=node_project${newToken}"`).then((response) => {
        response = response.replace(/\s/g, "")
        executeCommand(`docker network connect ${networkName} ${response}`);
    });

    console.log('Packing node project - Done!')
}

async function updateConfig(){
    let config = JSON.parse(fs.readFileSync('./node_modules/test-up-tool-kit/config.json'))
    config["nodeContainerName"] = `node_project${newToken}`;
    config["newToken"] = newToken;
    fs.writeFileSync('./node_modules/test-up-tool-kit/config.json', JSON.stringify(config));
}

async function start(){
    await syncInfo();
    await createToken();
    await updateENV();
    await packNode();
    await rollbackENV();
    await updateConfig();
    process.exit();
}

start();