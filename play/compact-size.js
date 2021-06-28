const { BufferWriter } = require('../src/bufferutils');

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

const l = 0x10000000a;
const cs = compactSize(l);

console.log(cs.toString('hex'))

// # ('0xc8', '->', '\xc8')
// # ('0xfff6', '->', '\xfd\xf6\xff')
// # ('0xfffffff6', '->', '\xfe\xf6\xff\xff\xff')
// # ('0x10000000a', '->','\xff\n\x00\x00\x00\x01\x00\x00\x00')