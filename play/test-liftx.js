const ecpair = require('../src/ecpair')

const x = Buffer.from('79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798', 'hex');
const point = ecpair.liftX(x)
console.log('point', point.toString('hex'))
