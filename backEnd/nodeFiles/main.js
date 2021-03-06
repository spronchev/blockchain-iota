
// var done=false;
var test = 0;
var testSelect = 0;

async function run() {

    var iotaValue = 0;
    await getIotaValue().then(function (elem) {
        iotaValue = elem;
    }).catch((err) => setImmediate(() => {
        throw err;
    }));

    // console.log(iotaValue);

    const connectionDb = require('./connection.js');
    const { ClientBuilder } = require('@iota/client');


    // client will connect to testnet by default
    const client = new ClientBuilder()
        .node('https://chrysalis-nodes.iota.org')
        .build();

    const outputs = await client.getAddressOutputs('iota1qz4qx5xrl59wnnvswxk4mjvhjkdk25yveft3us2hgxd5tn2l6gz4vnwld2d');

    // console.log(outputs);

    for (var i = 0; i < outputs.length; i++) {

        const output = await client.getOutput(outputs[i]);
        var transactionId = output.transactionId;
        var iotaAmount = output.amount;
        var kwhConv = ((iotaAmount / 10000) * iotaValue) / 13.19;
        var roundedKwh=Math.round(kwhConv);


        connectionDb.selectTransactions(transactionId).then(function (rows) {
            if (rows.length == 0) {
                connectionDb.insertTransaction(transactionId, iotaValue, iotaAmount, roundedKwh);
                console.log("new row found");
            }
            testSelect++;
        }).catch((err) => setImmediate(() => {
            throw err;
        }));

    }

    test++;
    // https://chrysalis-nodes.iota.org
}

async function getIotaValue() {
    const CoinGecko = require('coingecko-api');

    //2. Initiate the CoinGecko API Client
    const CoinGeckoClient = new CoinGecko();

    //3. Make calls
    return new Promise(function (resolve) {
        async function cos() {
            let dataObt = await CoinGeckoClient.simple.price({
                ids: ['iota'],
                vs_currencies: ['usd'],
            });
            // console.log(dataObt);
            var keys = Object.keys(dataObt.data);
            var subkeys = Object.keys(dataObt.data[keys[0]]);
            var currentIotaValue = dataObt.data[keys[0]][subkeys[0]];
            // console.log(currentIotaValue);
            resolve(currentIotaValue);
        }

        cos();
    });

}



var call_print_data = () => new Promise((resolve, reject) => {
    var count = 0;
    var interval = setInterval(async () => {
        var res = await run();
        count += 1;

    }, 10000); // 10 sec interval
});


async function main() {
    process.stderr.write("--Start--")
    var data = await call_print_data(); // The main function will wait 5 minutes here
}
main();
// run();


