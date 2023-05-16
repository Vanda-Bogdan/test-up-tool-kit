const fs = require('fs')
const path = require('path')

const scriptName = 'testup'
const scriptCommand = 'node node_modules/test-up-tool-kit/scripts/index.js'

const packageJsonPath = path.join(process.cwd(), 'package.json')
console.log('----------------------------------------')
console.log(packageJsonPath)
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))

packageJson.scripts[scriptName] = scriptCommand

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))