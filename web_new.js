solc = require('solc');
fs=require('fs');

const { Web3 } = require('web3');
let web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

let fileContent = fs.readFileSync('demo.sol').toString();
console.log(fileContent);

var input = {
    language: 'Solidity',
    sources: {
        'demo.sol': {
            content: fileContent
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};
var output = JSON.parse(solc.compile(JSON.stringify(input)));

for (var contractName in output.contracts['demo.sol']) {
    console.log(contractName + ': ' + output.contracts['demo.sol'][contractName].evm.bytecode.object);
    console.log("ABI: " + JSON.stringify(output.contracts['demo.sol'][contractName].abi));
    console.log("bytecode: " + JSON.stringify(output.contracts['demo.sol'][contractName].evm.bytecode.object));
}

contract = new web3.eth.Contract(output.contracts['demo.sol']['demo'].abi);

web3.eth.getAccounts().then(function(accounts) {
    console.log("Accounts: " + accounts);
    console.log("Deploying the contract from account: " + accounts[0]);

    contract.deploy({
        data: '0x' + output.contracts['demo.sol']['demo'].evm.bytecode.object,
        arguments: []
    }).send({
        from: accounts[0],
        gas: 1500000,
        gasPrice: '30000000000000'
    })
    .on('receipt', function(receipt){
        console.log("Contract deployment receipt received:", receipt);
    })
    .then(function(newContractInstance){
        console.log("Contract deployed at address: " + newContractInstance.options.address);
    });
});