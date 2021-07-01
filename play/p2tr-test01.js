const bscript = require('../src/script');
const { validateTaprootScript } = require('./p2tr-witness');
const fixtures = require('../test/fixtures/p2tr.json');

let failedCount = 0;

fixtures
    .filter(f => f.success.witness && f.success.witness.length)
    .forEach((f, i) => {
        const utxo = Buffer.from(f.prevouts[f.index], 'hex');
        const q = utxo.slice(11);
        const witness = f.success.witness.map(w => Buffer.from(w, 'hex'));

        try {
            validateTaprootScript(utxo.slice(9), witness);
        } catch (err) {
            console.log(`[${i}]: ${err.message}`);
            failedCount++

            // console.log('q: ', utxo.slice(11).toString('hex'));

            if (i === -48) {
                console.log('utxo asm: ', bscript.toASM(utxo.slice(9)));
                console.log(JSON.stringify(f));
                throw err;
            }

        }

    });

console.log(`failed/total: ${failedCount} / ${fixtures.length}`);