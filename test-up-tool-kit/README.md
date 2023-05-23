# test-up-tool-kit

# Install

```
npm install test-up-tool-kit
```
# Initialization

Run following command to init:

```sh
node ./node_modules/test-up-tool-kit/init.js
```

# Usage

Create compose-group for testing:

```sh
npm run composeup
```

Pack your node project to container and connect it to compose-group:

```sh
npm run packnode
```

Run jest tests inside node container:

```sh
npm run testup
```

Check the report file in testup/test-reports