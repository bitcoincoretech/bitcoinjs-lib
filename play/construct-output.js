const BN = require('bn.js');
const ecc = require('tiny-secp256k1');
const ecpair = require('../src/ecpair');
const taggedHash = require('../src/crypto').taggedHash;

const TAP_TWEAK_TAG = Buffer.from('TapTweak', 'utf8');
const EC_P = new BN(
    Buffer.from(
        'fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f',
        'hex',
    ),
);

const G = Buffer.from('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 'hex');

const EC_P_REDUCTION = BN.red(EC_P);

function tweakPublicKey(pubKey, h) {
    const tweakHash = taggedHash(TAP_TWEAK_TAG, Buffer.concat([pubKey, h]));
    const t = new BN(tweakHash);
    if (t.gte(EC_P)) {
        throw new Error('Tweak value over the SECP256K1 Order');
    }

    const P = ecpair.liftX(pubKey);
    const Q = ecc.pointAddScalar(P, tweakHash);
    return [Q[64] % 2, Q.slice(1, 33)];
}


function tweakSecretKey(privKey, h) {
    console.log('x0', new BN(privKey).toString());
    const P = ecc.pointFromScalar(privKey, false);

    // console.log('P.x', new BN(P.slice(1, 33)).toString());
    // console.log('P.y', new BN(P.slice(33)).toString());

    // const keyPair = ecpair.fromPrivateKey(privKey, { compressed: false });
    // console.log('P1.x', new BN(keyPair.publicKey.slice(1, 33)).toString(10));
    // console.log('P1.y', new BN(keyPair.publicKey.slice(33)).toString(10));

    // const P2 = ecc.pointMultiply(G, privKey);
    // console.log('P2', new BN(P2.slice(1, 33)).toString(10))



    // const secretKey = P[0] === 0x02 ? new BN(privKey) : EC_P.sub(new BN(privKey)); //??????

    // const tweakHash = taggedHash(TAP_TWEAK_TAG, Buffer.concat([P.slice(1, 33), h]));
    // const t = new BN(tweakHash);
    // if (t.gte(EC_P)) {
    //     throw new Error('Tweak value over the SECP256K1 Order');
    // }

    // return secretKey.toRed(EC_P_REDUCTION).add(t);
}


// def taproot_tweak_seckey(seckey0, h):
//     P = point_mul(G, int_from_bytes(seckey0))
//     seckey = seckey0 if has_even_y(P) else SECP256K1_ORDER - seckey0
//     t = int_from_bytes(tagged_hash("TapTweak", bytes_from_int(x(P)) + h))
//     if t >= SECP256K1_ORDER:
//         raise ValueError
//     return (seckey + t) % SECP256K1_ORDER

const pubKey = Buffer.from('85fcbac099a9abaebf2ac1a7fe3beea4f422873d826c7043af41f1d74b140eda', 'hex');
const h = Buffer.from('982eb316dd5ab519ec32e699ea485dce670f75325459a84b86cb697da4df315a', 'hex');

// const x = tweakPublicKey(pubKey, h);
// console.log(x[0], x[1].toString('hex'))

// priv key 074e6a1b6b938d9e2b226f0d26d4d4acefb756ad8a99981bebef5042ae75646e
// tweak 3a6433c925c48ff72e2592bb773f83ecffa419e4dd5f07c35a600875dc79d5ce
// x0 3304736335496013581270651908362709683685683084452582714536813111511753253998
// hex(x0) 0x74e6a1b6b938d9e2b226f0d26d4d4acefb756ad8a99981bebef5042ae75646e
// P (53430353449080239413176583068429118808829144644876406734308479077517594253373, 74583920015819746246773260271804695364017156239743376844372542995215891485399, 100382856461699887635434718960198682892290712886528098247498463400522730094383)
// x1 23106451000801657652133565226451892561882153864631275534695715719550272303456
// t 26411187336297671233404217134814602245567836949083858249232528831062025557454

const privKey = Buffer.from('074e6a1b6b938d9e2b226f0d26d4d4acefb756ad8a99981bebef5042ae75646e', 'hex');
const tweak = Buffer.from('3a6433c925c48ff72e2592bb773f83ecffa419e4dd5f07c35a600875dc79d5ce', 'hex');
const ret = tweakSecretKey(privKey, tweak);
// console.log('ret', ret.toString('hex'));