import string

# Characters used for Base62 encoding
ALPHABET = string.digits + string.ascii_letters

def encode(num: int) -> str:
    """
    Encodes an integer to a Base62 string.
    """
    if num == 0:
        return ALPHABET[0]
    
    arr = []
    base = len(ALPHABET)
    while num:
        num, rem = divmod(num, base)
        arr.append(ALPHABET[rem])
    
    arr.reverse()
    return ''.join(arr)

def decode(s: str) -> int:
    """
    Decodes a Base62 string back to an integer.
    """
    base = len(ALPHABET)
    strlen = len(s)
    num = 0
    
    idx = 0
    for char in s:
        power = (strlen - (idx + 1))
        num += ALPHABET.index(char) * (base ** power)
        idx += 1
    return num
