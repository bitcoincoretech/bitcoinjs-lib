const BN = require('bn.js');
const ecpair = require('../src/ecpair');
const taggedHash = require('../src/crypto').taggedHash;

const TAP_TWEAK_TAG = Buffer.from('TapTweak', 'utf8');
const EC_P = new BN(
    Buffer.from(
        'fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f',
        'hex',
    ),
);

function tweakPublicKey(pubKey, h) {
    const tweakHash = taggedHash(TAP_TWEAK_TAG, Buffer.concat([pubKey, h]));
    const t = new BN(tweakHash);
    if (t.gte(EC_P)) {
        throw new Error('Tweak value over the SECP256K1 Order');
    }

    const P = ecpair.liftX(pubKey);
    const T = ecpair.pointFromScalar(tweakHash);
    const Q = ecpair.pointAdd(P, T);
    return [Q[64] % 2, Q.slice(1, 33)];
}


function tweakSecretKey(s, h) {

}
const pubKey = Buffer.from('85fcbac099a9abaebf2ac1a7fe3beea4f422873d826c7043af41f1d74b140eda', 'hex');
const h = Buffer.from('982eb316dd5ab519ec32e699ea485dce670f75325459a84b86cb697da4df315a', 'hex');

const x = tweakPublicKey(pubKey, h);
console.log(x[0], x[1].toString('hex'))
