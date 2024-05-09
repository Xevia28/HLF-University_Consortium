const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Static Middleware
app.use(express.static(path.join(__dirname, 'public')));

app.post('/students', async (req, res) => {
    try {
        const { id, name, dateOfBirth, gender, graduationStatus } = req.body;
        const result = await submitTransaction('CreateStudent', id, name, dateOfBirth, gender,
            graduationStatus);
        res.status(204).send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});

app.get('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await evaluateTransaction('ReadStudent', id);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(404).send(`Failed to evaluate transaction: ${error}`);
    }
});

app.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dateOfBirth, gender, graduationStatus } = req.body;
        const result = await submitTransaction('UpdateStudent', id, name, dateOfBirth, gender,
            graduationStatus);
        res.status(204).send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});

app.delete('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await submitTransaction('DeleteStudent', id);
        res.send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});

async function getContract() {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get('Admin@natuni.edu');
    const gateway = new Gateway();
    const connectionProfile = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'connection.json'),
        'utf8'));
    const connectionOptions = {
        wallet, identity: identity, discovery: {
            enabled: false, asLocalhost:
                true
        }
    };
    await gateway.connect(connectionProfile, connectionOptions);
    const network = await gateway.getNetwork('natunichannel');
    const contract = network.getContract('studentmgt');
    return contract;
}

async function submitTransaction(functionName, ...args) {
    const contract = await getContract();
    const result = await contract.submitTransaction(functionName, ...args);
    return result.toString();
}

async function evaluateTransaction(functionName, ...args) {
    const contract = await getContract();
    const result = await contract.evaluateTransaction(functionName, ...args);
    return result.toString();
}

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

module.exports = app; // Exporting app