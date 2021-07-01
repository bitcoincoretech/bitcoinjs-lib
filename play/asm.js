const bscript = require('../src/script');

const hex = '415229340337f398de30159c2284f99ddd8a2609f5cee683200327a224fb61ff210a94d64f8f267fdc3d1f551a58a8b7845e03eabe0e9566fc18d7de717a26fd7dcd7563ab2052997cc5b6000ef2b79037c06a603dec4c5a46948c21a6758a320bf8d629cb0e67ab20e1dad25a1036c2471734e5dbb6de5008324bae2f69ddf4b63c1517d824095ea268a';
const buff = Buffer.from(hex, 'hex');

const asm = bscript.toASM(buff)
console.log('asm: ', asm);