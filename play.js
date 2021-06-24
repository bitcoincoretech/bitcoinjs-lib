const bscript = require('./src/script');
const {
    Transaction
} = require('./src/transaction')

const hex = '4da5fbaa000000002251206d1cb3f7811934f57a680ce8cabda34527cbcebf218a0fdc833b7a8e7df361ee';
const prevout = Buffer.from(hex, 'hex');
const prevsScriptOut = prevout.slice(9)

const asm = bscript.toASM(prevsScriptOut)
console.log('######## asm: ', asm)