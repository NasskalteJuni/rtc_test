/**
 * Created by NasskalteJuni on 18.06.2017.
 */

const defaultRandomToken = () => Math.random().toString(32).substring(2, 12);
const randomToken = (len) => {
    len = len || 10;
    let token = '';
    for(let i=0; i < Math.ceil(len/10); i++){
        token+=defaultRandomToken();
    }
    return token.substring(0,len);
};

module.exports = randomToken;