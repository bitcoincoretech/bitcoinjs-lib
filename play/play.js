const bscript = require('../src/script');

const hex = '7520c7b5db9562078049719228db2ac80cb9643ec96c8055aa3b29c2c03d4d99edb0ac';
const prevout = Buffer.from(hex, 'hex');
const prevsScriptOut = prevout; //.slice(9)

const asm = bscript.toASM(prevsScriptOut)
console.log('######## asm: ', asm)

const taggedHash = require('../src/crypto').taggedHash;

const tag = Buffer.from('TapBranch', 'utf8')
const hash = taggedHash(tag, prevout)
console.log('hash', hash.toString('hex'));