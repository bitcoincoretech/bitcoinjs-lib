
const bscript = require('../src/script');
const ecpair = require('../src/ecpair');
const taggedHash = require('../src/crypto').taggedHash;
const { BufferWriter } = require('../src/bufferutils')

const OPS = bscript.OPS;
const ANNEX_PREFIX = 0x50;
const EC_N = Buffer.from('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 'hex');

const TAP_LEAF_TAG = Buffer.from('TapLeaf', 'utf8');
const TAP_BRANCH_TAG = Buffer.from('TapBranch', 'utf8');
const TAP_TWEAK_TAG = Buffer.from('TapTweak', 'utf8');


function validateTaprootScript(scriptPubKey, witness) {
    if (
        scriptPubKey.length !== 34 ||
        scriptPubKey[0] !== OPS.OP_1 ||
        scriptPubKey[1] !== 32
    ) {
        throw new TypeError('Output is invalid');
        // console.log('Output is invalid');
        // return;
    }


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
        throw new Error(`The control-block length of ${controlBlock.length} is incorrect!`);
    }
    const m = (controlBlock.length - 33) / 32;
    if (m > 128) {
        throw new Error(`The control-block length is too large. Got ${controlBlock.length}.`);
    }
    const script = witness[witness.length - 2];

    const p = controlBlock.slice(1, 33);
    const P = ecpair.liftX(p);

    const v = controlBlock[0] & 0xfe; // leaf version
    // TODO: fail for unkver

    const k = [];
    const e = [];

    const cSize = _compactSize(script.length);
    const tapLeafMsg = Buffer.concat([Buffer.from([v]), cSize, script]);
    k[0] = taggedHash(TAP_LEAF_TAG, tapLeafMsg); // TODO: test values?


    for (let j = 0; j < m; j++) {
        e[j] = controlBlock.slice(33 + 32 * j, 65 + 32 * j);
        if (k[j].compare(e[j]) < 0) {
            k[j + 1] = taggedHash(TAP_BRANCH_TAG, Buffer.concat([k[j], e[j]]));
        } else {
            k[j + 1] = taggedHash(TAP_BRANCH_TAG, Buffer.concat([e[j], k[j]]));
        }
    }

    const t = taggedHash(TAP_TWEAK_TAG, Buffer.concat([p, k[m]]));
    if (t.compare(EC_N) >= 0) {
        throw new Error('Over the order of secp256k1')
    }

    const T = ecpair.pointFromScalar(t, false);

    const q = scriptPubKey.slice(2);
    const Q = ecpair.pointAdd(P, T);

    if (q.compare(Q.slice(1, 33)) !== 0) {
        // console.log('script', bscript.toASM(script));
        // console.log('p', p.toString('hex'));
        // console.log('v', v);
        // console.log('P', P.toString('hex'));
        // console.log('cSize', cSize.toString('hex'));
        // console.log('t', t.toString('hex'));
        // console.log('T', T.toString('hex'));
        // console.log('Q', Q.toString('hex'));
        throw new Error('Tweaked key does not match!')
    }

    if ((controlBlock[0] & 1) !== (Q[64] % 2)) {
        throw new Error('Incorrect parity!')
    }
}

function _compactSize(l) {
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

module.exports = {
    validateTaprootScript
}