'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const NETWORKS = require('./networks');
const types = require('./types');
const ecc = require('tiny-secp256k1');
const BN = require('bn.js');
const randomBytes = require('randombytes');
const typeforce = require('typeforce');
const wif = require('wif');
const EC_P = new BN(
  Buffer.from(
    'fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f',
    'hex',
  ),
);
const EC_P_REDUCTION = BN.red(EC_P);
const EC_P_QUADRATIC_RESIDUE = EC_P.addn(1).divn(4);
const BN_2 = new BN(2);
const BN_3 = new BN(3);
const BN_7 = new BN(7);
const isOptions = typeforce.maybe(
  typeforce.compile({
    compressed: types.maybe(types.Boolean),
    network: types.maybe(types.Network),
  }),
);
class ECPair {
  constructor(__D, __Q, options) {
    this.__D = __D;
    this.__Q = __Q;
    this.lowR = false;
    if (options === undefined) options = {};
    this.compressed =
      options.compressed === undefined ? true : options.compressed;
    this.network = options.network || NETWORKS.bitcoin;
    if (__Q !== undefined) this.__Q = ecc.pointCompress(__Q, this.compressed);
  }
  get privateKey() {
    return this.__D;
  }
  get publicKey() {
    if (!this.__Q) this.__Q = ecc.pointFromScalar(this.__D, this.compressed);
    return this.__Q;
  }
  toWIF() {
    if (!this.__D) throw new Error('Missing private key');
    return wif.encode(this.network.wif, this.__D, this.compressed);
  }
  sign(hash, lowR) {
    if (!this.__D) throw new Error('Missing private key');
    if (lowR === undefined) lowR = this.lowR;
    if (lowR === false) {
      return ecc.sign(hash, this.__D);
    } else {
      let sig = ecc.sign(hash, this.__D);
      const extraData = Buffer.alloc(32, 0);
      let counter = 0;
      // if first try is lowR, skip the loop
      // for second try and on, add extra entropy counting up
      while (sig[0] > 0x7f) {
        counter++;
        extraData.writeUIntLE(counter, 0, 6);
        sig = ecc.signWithEntropy(hash, this.__D, extraData);
      }
      return sig;
    }
  }
  verify(hash, signature) {
    return ecc.verify(hash, this.publicKey, signature);
  }
}
function fromPrivateKey(buffer, options) {
  typeforce(types.Buffer256bit, buffer);
  if (!ecc.isPrivate(buffer))
    throw new TypeError('Private key not in range [1, n)');
  typeforce(isOptions, options);
  return new ECPair(buffer, undefined, options);
}
exports.fromPrivateKey = fromPrivateKey;
function fromPublicKey(buffer, options) {
  typeforce(ecc.isPoint, buffer);
  typeforce(isOptions, options);
  return new ECPair(undefined, buffer, options);
}
exports.fromPublicKey = fromPublicKey;
function liftX(buffer) {
  typeforce(types.Buffer256bit, buffer);
  const x = new BN(buffer);
  if (x.gte(EC_P)) return null;
  const x1 = x.toRed(EC_P_REDUCTION);
  const ySq = x1
    .redPow(BN_3)
    .add(BN_7)
    .mod(EC_P);
  const y = ySq.redPow(EC_P_QUADRATIC_RESIDUE);
  if (!ySq.eq(y.redPow(BN_2))) {
    return null;
  }
  const y1 = (y & 1) === 0 ? y : EC_P.sub(y);
  // TODO: which is the best format to return the coordinates?
  return Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from(x1.toBuffer('be')),
    Buffer.from(y1.toBuffer('be')),
  ]);
}
exports.liftX = liftX;
function fromWIF(wifString, network) {
  const decoded = wif.decode(wifString);
  const version = decoded.version;
  // list of networks?
  if (types.Array(network)) {
    network = network
      .filter(x => {
        return version === x.wif;
      })
      .pop();
    if (!network) throw new Error('Unknown network version');
    // otherwise, assume a network object (or default to bitcoin)
  } else {
    network = network || NETWORKS.bitcoin;
    if (version !== network.wif) throw new Error('Invalid network version');
  }
  return fromPrivateKey(decoded.privateKey, {
    compressed: decoded.compressed,
    network: network,
  });
}
exports.fromWIF = fromWIF;
function makeRandom(options) {
  typeforce(isOptions, options);
  if (options === undefined) options = {};
  const rng = options.rng || randomBytes;
  let d;
  do {
    d = rng(32);
    typeforce(types.Buffer256bit, d);
  } while (!ecc.isPrivate(d));
  return fromPrivateKey(d, options);
}
exports.makeRandom = makeRandom;
const pointFromScalar = ecc.pointFromScalar; // could use the fromPrivateKey...
exports.pointFromScalar = pointFromScalar;
const pointAdd = ecc.pointAdd;
exports.pointAdd = pointAdd;
