const BN = require('bn.js');
const elliptic = require('elliptic');
const hash = require('hash.js');

const curves = elliptic.curves;
var curve = elliptic.curve.short;

curve.prototype.pointFromXWithPow = function pointFromXWithPow(x, pow) {
    x = new BN(x, 16);
    if (!x.red)
      x = x.toRed(this.red);
  
    var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);
    var y = y2.redPow(pow);
    if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
      throw new Error('invalid point');
  
    return this.point(x, y);
};

// Create and initialize EC context of alt_bn128, the EC curve embedded in EVM
var ec = new elliptic.ec(new curves.PresetCurve({
    type: 'short',
    prime: null,
    p: '30644e72 e131a029 b85045b6 8181585d 97816a91 6871ca8d 3c208c16 d87cfd47',
    a: '0',
    b: '3',
    n: '30644e72 e131a029 b85045b6 8181585d 2833e848 79b97091 43e1f593 f0000001',
    hash: hash.sha256,
    gRed: false,
    g: [
        '1',
        '2',
    ]
}));

module.exports = ec;