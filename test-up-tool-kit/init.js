const fs = require('fs')
const path = require('path')

const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))

packageJson.scripts['composeup'] = 'node node_modules/test-up-tool-kit/composeup.js'
packageJson.scripts['packnode'] = 'node node_modules/test-up-tool-kit/packnode.js'
packageJson.scripts['testup'] = 'node node_modules/test-up-tool-kit/runtests.js'

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))