p = 2 ** 256 - 2 ** 32 - 977
a = 0
b = 7


def lift_x(x):
    """Given an X coordinate on the curve, return a corresponding affine point for which the Y coordinate is even."""
    x_3 = pow(x, 3, p)
    print("x_3", x_3)
    v = x_3 + a * x + b
    print("y2", v)
    y = modsqrt(v, p)
    print("y", y)
    print("p-y", p - y)
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


v = int("d3a88391bda57be92148aba9945577043513d0d47d0c154bc2a08fa42deef132", 16)
P = lift_x(v)
print("P", P)
# print("hex(P.y)",hex(P[1]))
