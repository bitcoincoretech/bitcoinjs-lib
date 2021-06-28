import struct


def ser_compact_size(l):
    r = b""
    if l < 253:
        r = struct.pack("B", l)
    elif l < 0x10000:
        r = struct.pack("<BH", 253, l)
    elif l < 0x100000000:
        r = struct.pack("<BI", 254, l)
    else:
        r = struct.pack("<BQ", 255, l)
    return r


val = 0x100000000 + 10
x = ser_compact_size(val)
print(hex(val), "->", x)

# ('0xc8', '->', '\xc8')
# ('0xfff6', '->', '\xfd\xf6\xff')
# ('0xfffffff6', '->', '\xfe\xf6\xff\xff\xff')
# ('0x10000000a', '->','\xff\n\x00\x00\x00\x01\x00\x00\x00')