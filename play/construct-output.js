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
    console.log('tweak', tweakHash.toString('hex'));
    const t = new BN(tweakHash);
    if (t.gte(EC_P)) {
        throw new Error('Tweak value over the SECP256K1 Order');
    }

    const x = new BN(pubKey, 16, 'be');
    console.log('x:', x.toBuffer('be').toString('hex'))
    const P = ecpair.liftX(pubKey);
    console.log('P', P.toString('hex'));
    const T = ecpair.pointFromScalar(tweakHash);
    const Q = ecpair.pointAdd(P, T);
    return [Q[64] % 2, Q.slice(1, 33)];
}

// def taproot_tweak_pubkey(pubkey, h):
//     t = int_from_bytes(tagged_hash("TapTweak", pubkey + h))
//     if t >= SECP256K1_ORDER:
//         raise ValueError
//     Q = point_add(lift_x(int_from_bytes(pubkey)),      point_mul(G, t))
//     return 0 if has_even_y(Q) else 1, bytes_from_int(x(Q))

function tweakSecretKey(s, h) {

}

// scripts 1
// pubkey d3a88391bda57be92148aba9945577043513d0d47d0c154bc2a08fa42deef132
// h d6ac79e6ff8a1805bebcff6c2410dc8fb68ac42d3026e1088b06001e6eef67d6
// tweak 1a762fb15420d6a4d95734393a2e64721eb7ed654a5db8e1fc1fa832fa714324
// key d3a88391bda57be92148aba9945577043513d0d47d0c154bc2a08fa42deef132
// tweak 1a762fb15420d6a4d95734393a2e64721eb7ed654a5db8e1fc1fa832fa714324
// x_coord 95735749415887772119947390298082727004669673153545264222725221753292730593586
// P (95735749415887772119947390298082727004669673153545264222725221753292730593586, 5505234187912211846479931653401008678238631827599929026681743302723090478794, 1)
// t 11968951179657376146891216719454062689509419693537988896770542948329574187812
// Q (14796109031452140924438301456147176490881172097676943805502538773273342308878, 263121106980580573692809472283593834097162334221651992620581412415201694250, 1)
// tweaked 20b64d0a41cd5d4e4618aa0bba52f983cf26e60760952150cfd336a23e42f20e False

const pubKey = Buffer.from('d3a88391bda57be92148aba9945577043513d0d47d0c154bc2a08fa42deef132', 'hex');
const h = Buffer.from('d6ac79e6ff8a1805bebcff6c2410dc8fb68ac42d3026e1088b06001e6eef67d6', 'hex');

// const x = tweakPublicKey(pubKey, h);
// console.log(x[0], x[1].toString('hex'))

console.log('pubKey decimal', new BN('d3a88391bda57be92148aba9945577043513d0d47d0c154bc2a08fa42deef132', 16, 'be').toString())
// const pubKeyLE = new BN(pubKey).toBuffer('le');
const P = ecpair.liftX(pubKey);
console.log('P', P.toString('hex'));
const x = P.slice(1, 33);
const y = P.slice(33);
// console.log('P.x', x.toString('hex'))
console.log('P.x', new BN(x, 16, 'be').toString());
console.log('P.y', new BN(y).toString());
console.log('hex(P.y)', new BN(y).toString('hex'));

console.log('y', new BN(y, 10).toString(10))