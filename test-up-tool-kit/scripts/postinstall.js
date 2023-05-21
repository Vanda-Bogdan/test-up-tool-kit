const fs = require('fs')
const path = require('path')

const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))

packageJson.scripts['testup'] = 'node node_modules/test-up-tool-kit/scripts/index.js'

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))