p = 2 ** 256 - 2 ** 32 - 977
a = 0
b = 7


def lift_x(x):
    """Given an X coordinate on the curve, return a corresponding affine point for which the Y coordinate is even."""
    x_3 = pow(x, 3, p)
    v = x_3 + a * x + b
    y = modsqrt(v, p)
    if y is None:
        return None
    return (x, p - y if y & 1 else y, 1)


def modsqrt(a, p):
    """Compute the square root of a modulo p when p % 4 = 3.

    The Tonelli-Shanks algorithm can be used. See https://en.wikipedia.org/wiki/Tonelli-Shanks_algorithm

    Limiting this function to only work for p % 4 = 3 means we don't need to
    iterate through the loop. The highest n such that p - 1 = 2^n Q with Q odd
    is n = 1. Therefore Q = (p-1)/2 and sqrt = a^((Q+1)/2) = a^((p+1)/4)

    secp256k1's is defined over field of size 2**256 - 2**32 - 977, which is 3 mod 4.
    """
    if p % 4 != 3:
        raise NotImplementedError("modsqrt only implemented for p % 4 = 3")
    sqrt = pow(a, (p + 1) // 4, p)
    if pow(sqrt, 2, p) == a % p:
        return sqrt
    return None


v = int("a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a36", 16)
P = lift_x(v)
print(P)
print(hex(P[1]))

# P 04a7957acbaaf7b444c53d9e0c9436e8a8a3247fd515095d66ddf6201918b40a36c37b6f8b761f38e63822f3eb14d0bfc90cb17deb11d3f11ad1b9277c061120a6
# (75800353429985937174411509990545465689769652460566598164193139917472828492342L, 88419097516421462002705622384172466804817355303201779050493513811414523912358L, 1)
