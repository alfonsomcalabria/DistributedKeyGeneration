const BN = require('bn.js');
const Share = require('./Share');

class resultShare{
    
    constructor(share, commitments){
        this.share = share;
        this.commitments = commitments;
    }
}

module.exports = resultShare;