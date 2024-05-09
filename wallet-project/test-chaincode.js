const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
    // Load the network configuration
    const ccpPath = path.resolve(__dirname, '.', 'connection.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));// Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    // Check to see if we've already enrolled the user.
    const identity = await wallet.get('Admin@natuni.edu');
    if (!identity) {
        console.log(`An identity for the user "${identity}" does not exist in the wallet`);
        return;
    }
    // Create a new gateway instance for interacting with the fabric network.
    const gateway = new Gateway();
    try {
        // Connect to the gateway using the identity from wallet and the connection profile.
        await gateway.connect(ccp, {
            wallet, identity: identity, discovery: {
                enabled: false, asLocalhost: false
            }
        });
        // Now connected to the gateway.
        console.log('Connected to the gateway.');
        // ... you can now use the gateway ...
        // For example, get a contract and submit a transaction
        const network = await gateway.getNetwork('natunichannel');
        const contract = network.getContract('studentmgt');
        //CREATE
        console.log('\n--> Submit Transaction: Create, function creates');
        await contract.submitTransaction('CreateStudent', '3', 'Jane Doe', '2024-01-02T15:04:05Z', 'Female', 'false');
        console.log('*** Result: committed');
        // //READ
        console.log('\n--> Evaluate Transaction: ReadStudentr');
        let result = await contract.evaluateTransaction('ReadStudent', '3');
        console.log(`*** Result: ${prettyJSONString(result.toString())}`);
    } finally {
        // Disconnect from the gateway when you're done.
        gateway.disconnect();
    }
}

main().catch(console.error);