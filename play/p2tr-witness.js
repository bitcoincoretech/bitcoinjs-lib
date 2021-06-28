const BN = require('bn.js'); // TODO: remove? see changelog bn.js
const ecpair = require('../src/ecpair')
const taggedHash = require('../src/crypto').taggedHash;

const ANNEX_PREFIX = 0x50;
const EC_N = Buffer.from('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 'hex');

const TAP_LEAF_TAG = Buffer.from('TapLeaf', 'utf8');
const TAP_BRANCH_TAG = Buffer.from('TapBranch', 'utf8');
const TAP_TWEAK_TAG = Buffer.from('TapTweak', 'utf8');

const witnessHex = [
    "9675a9982c6398ea9d441cb7a943bcd6ff033cc3a2e01a0178a7d3be4575be863871c6bf3eef5ecd34721c784259385ca9101c3a313e010ac942c99de05aaaa602",
    "5799cf4b193b730fb99580b186f7477c2cca4d28957326f6f1a5d14116438530e7ec0ce1cd465ad96968ae8a6a09d4d37a060a115919f56fcfebe7b2277cc2df5cc08fb6cda9105ee2512b2e22635aba",
    "7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac",
    "c1a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a3668f9a4ccdffcf778da624dca2dda0b08e763ec52fd4ad403ec7563a3504d0cc168b9a77a410029e01dac89567c9b2e6cd726e840351df3f2f58fefe976200a19244150d04153909f660184d656ee95fa7bf8e1d4ec83da1fca34f64bc279b76d257ec623e08baba2cfa4ea9e99646e88f1eb1668c00c0f15b7443c8ab83481611cc3ae85eb89a7bfc40067eb1d2e6354a32426d0ce710e88bc4cc0718b99c325509c9d02a6a980d675a8969be10ee9bef82cafee2fc913475667ccda37b1bc7f13f64e56c449c532658ba8481631c02ead979754c809584a875951619cec8fb040c33f06468ae0266cd8693d6a64cea5912be32d8de95a6da6300b0c50fdcd6001ea41126e7b7e5280d455054a816560028f5ca53c9a50ee52f10e15c5337315bad1f5277acb109a1418649dc6ead2fe14699742fee7182f2f15e54279c7d932ed2799d01d73c97e68bbc94d6f7f56ee0a80efd7c76e3169e10d1a1ba3b5f1eb02369dc43af687461c7a2a3344d13eb5485dca29a67f16b4cb988923060fd3b65d0f0352bb634bcc44f2fe668836dcd0f604150049835135dc4b4fbf90fb334b3938a1f137eb32f047c65b85e6c1173b890b6d0162b48b186d1f1af8521945924ac8ac8efec321bf34f1d4b3d4a304a10313052c652d53f6ecb8a55586614e8950cde9ab6fe8e22802e93b3b9139112250b80ebc589aba231af535bb20f7eeec2e412f698c17f3fdc0a2e20924a5e38b21a628a9e3b2a61e35958e60c7f5087c"
];

const q = Buffer.from('1ebe8b90363bd097aa9f352c8b21914e1886bc09fe9e70c09f33ef2d2abdf4bc', 'hex'); // from test

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
const m = (controlBlock.length - 33) / 32;
if (m > 128) {
    throw new Error(`The control-block length is too large. Got ${controlBlock.length}.`);
}
const script = witness[witness.length - 2];

const p = controlBlock.slice(1, 33);
const v = controlBlock[0] & 0xfe; // leaf version

const P = ecpair.liftX(p);


const k = [];
const e = [];

const tapLeafMsg = Buffer.concat([Buffer.from([v]), Buffer.from([compactSize(script.length)]), script]);
k[0] = taggedHash(TAP_LEAF_TAG, tapLeafMsg); // test values?


for (let j = 0; j < m - 1; j++) {
    e[j] = controlBlock.slice(33 + 32 * j, 65 + 32 * j);
    if (k[j].compare(e[j]) < 0) {
        k[j + 1] = taggedHash(TAP_BRANCH_TAG, k[j] || e[j]);
    } else {
        k[j + 1] = taggedHash(TAP_BRANCH_TAG, e[j] || k[j]);
    }
}

const t = taggedHash(TAP_TWEAK_TAG, k[m - 1]);
if (t.compare(EC_N) >= 0) {
    throw new Error('Over the order of secp256k1')
}

const T = ecpair.pointFromScalar(t, false);

const Q = ecpair.pointAdd(P, T);
console.log('Q', Q.toString('hex'));

if (q !== x(Q) || (controlBlock[0] & 1) !== (y(Q) % 2)) {
    throw new Error('Check Failed!')
}

function x(buffer) {
    // check int starts with 0x04 and size 65
    // chunkHasUncompressedPubkey
    buffer.slice(1, 33)
}

function y(buffer) {
    // check int starts with 0x04 and size 65
    // chunkHasUncompressedPubkey
    buffer.slice(33)
}

function compactSize(l) {
    if (l < 253) {
        return Buffer.from([l]);
    }
    if (l < 0x10000) {
        const b = Buffer.allocUnsafe(3);
        const bw = new BufferWriter(b);
        bw.writeUInt8(253);
        bw.writeUInt16(l);
        return b
    }
    if (l < 0x100000000) {
        const b = Buffer.allocUnsafe(5);
        const bw = new BufferWriter(b);
        bw.writeUInt8(254);
        bw.writeUInt32(l);
        return b
    }
    const b = Buffer.allocUnsafe(9);
    const bw = new BufferWriter(b);
    bw.writeUInt8(255);
    bw.writeUInt64(l);
    return b
}

//Q: 040afd16b0586dea44b0818d1b8dec7b13f57c2f0f9135bba13be4c4ae2ced599398366ed7e78dbf5d8b0f22d7d2353a206d7b1a5d855a0de9fea27cab459b365e
//q: 1ebe8b90363bd097aa9f352c8b21914e1886bc09fe9e70c09f33ef2d2abdf4bc