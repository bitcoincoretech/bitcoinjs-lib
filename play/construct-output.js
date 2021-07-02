const BN = require('bn.js');
const ecc = require('tiny-secp256k1');
const ecpair = require('../src/ecpair');
const taggedHash = require('../src/crypto').taggedHash;

const TAP_TWEAK_TAG = Buffer.from('TapTweak', 'utf8');
const GROUP_ORDER = new BN(Buffer.from('fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141', 'hex'));

const GROUP_ORDER_REDUCTION = BN.red(GROUP_ORDER);

function tweakPublicKey(pubKey, h) {
    const tweakHash = taggedHash(TAP_TWEAK_TAG, Buffer.concat([pubKey, h]));
    const t = new BN(tweakHash);
    if (t.gte(GROUP_ORDER)) {
        throw new Error('Tweak value over the SECP256K1 Order');
    }

    const P = ecpair.liftX(pubKey);
    const Q = ecc.pointAddScalar(P, tweakHash);
    return [Q[64] % 2, Q.slice(1, 33)];
}


function tweakSecretKey(privKey, h) {
    const P = ecc.pointFromScalar(privKey);

    const secretKey = P[0] === 0x02 ? new BN(privKey) : GROUP_ORDER.sub(new BN(privKey));
    const tweakHash = taggedHash(TAP_TWEAK_TAG, Buffer.concat([P.slice(1, 33), h]));

    const t = new BN(tweakHash);
    if (t.gte(GROUP_ORDER)) {
        throw new Error('Tweak value over the SECP256K1 Order');
    }

    const s0 = secretKey.toRed(GROUP_ORDER_REDUCTION);
    const t0 = t.toRed(GROUP_ORDER_REDUCTION);

    return s0.redAdd(t0).fromRed()
}

const pubKey = Buffer.from('85fcbac099a9abaebf2ac1a7fe3beea4f422873d826c7043af41f1d74b140eda', 'hex');
const h = Buffer.from('982eb316dd5ab519ec32e699ea485dce670f75325459a84b86cb697da4df315a', 'hex');

// const x = tweakPublicKey(pubKey, h);
// console.log(x[0], x[1].toString('hex'))

// hash: fea3ab72b57692b79da0d28788dd3e61e41338ca3786b0f10b19680351203da1

// priv key b25a5171db96493d521376d2638be1e6ca134803689df54d6cec20127b21c763
// tweak d92c34f9a3d814c5d118b6b2eef796a41bc9b6534502d5ba72764a702e646c68
// x0 80671265394704751131509780624416161757499252299864293449009078490892893013859
// hex(x0) 0xb25a5171db96493d521376d2638be1e6ca134803689df54d6cec20127b21c763
// P
// x1 63109171191899158293825184743204445299180368216189056994397121928522405769866
// t 98229995034510602585886389127476191394518680195399667927993206579147674250344



const privKey = Buffer.from('b25a5171db96493d521376d2638be1e6ca134803689df54d6cec20127b21c763', 'hex');
const h1 = Buffer.from('fea3ab72b57692b79da0d28788dd3e61e41338ca3786b0f10b19680351203da1', 'hex');
const ret = tweakSecretKey(privKey, h1);
console.log('ret', ret.toString());