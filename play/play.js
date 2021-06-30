const bscript = require('../src/script');

const hex = '2083d8ee77a0f3a32a5cea96fd1624d623b836c1e5d1ac2dcde46814b619320c18ac';
const prevout = Buffer.from(hex, 'hex');
const prevsScriptOut = prevout; //.slice(9)

const asm = bscript.toASM(prevsScriptOut)
console.log('######## asm: ', asm)
