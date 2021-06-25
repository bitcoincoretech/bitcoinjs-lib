const bscript = require('../src/script');

const hex = 'cb127401000000002251201ebe8b90363bd097aa9f352c8b21914e1886bc09fe9e70c09f33ef2d2abdf4bc';
const prevout = Buffer.from(hex, 'hex');
const prevsScriptOut = prevout.slice(9)

const asm = bscript.toASM(prevsScriptOut)
console.log('######## asm: ', asm)
