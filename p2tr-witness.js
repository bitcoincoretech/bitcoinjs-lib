const BN = require('bn.js'); // TODO: remove? see changelog bn.js

const ANNEX_PREFIX = 0x50;
const EC_P = Buffer.from('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 'hex');
const P = new BN(EC_P);
const P_QUADRATIC_RESIDUE = P.addn(1).divn(4);
const BN_3 = new BN(3);
const BN_7 = new BN(7);

const witnessHex = [
    "9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602",
    "5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba",
    "7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac",
    "c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c"
];

const witness = witnessHex.map(w => Buffer.from(w, 'hex'));

if (!witness || !witness.length) {
    throw new Error('The witness stack has 0 elements');
}

// check for annex
if (witness.length >= 2 && (witness[witness.length - 1][0] === ANNEX_PREFIX)) {
    witness.pop(); // remove annex, ignored by taproot
}

// key path spending
if (witness.length === 1) {
    // the only element is the signature
    // must be checked against the tweaked public key
    // TODO
    return
}

// script path spending
const controlBlock = witness[witness.length - 1];
if (controlBlock.length < 33) {
    throw new Error(`The control-block length is too small. Got ${controlBlock.length}, expected 33.`);
}
if ((controlBlock.length - 33) % 32 !== 0) {
    throw new Error('The control-block length is incorrect!');
}
if ((controlBlock.length - 33) / 32 > 128) {
    throw new Error(`The control-block length is too large. Got ${controlBlock.length}.`);
}
const script = witness[witness.length - 2];

const pxxx = controlBlock.slice(1, 33);


const leafVersion = controlBlock[0] & 0xfe;



function liftX(b) {
    console.log('liftX IN');
    // check if x instance of buffer and length 32
    const x = new BN(b);
    if (x.gte(P)) return null;
    const yy = x.pow(BN_3).add(BN_7).mod(P);
    // const y = yy.pow(P_QUADRATIC_RESIDUE).mod(P);

    console.log('liftX OUT');
    return yy;
}


// const p = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f');
// const q = (p + 1n) / 4n;

// function liftX(hex) {
//     console.log('liftX IN');

//     const x = BigInt(hex);

//     if (x >= p) return null;
//     const yy = (x ** 3n + 7n) % p;
//     // const y = (yy ** q) % p;
    

//     console.log('liftX OUT');
//     return yy;
// }

const x = '0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798';
const y = liftX(x);
console.log('y', y.toJSON());