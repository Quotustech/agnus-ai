// require('dotenv').config();
const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;
const jwt = process.env.REACT_APP_PINATA_JWT
console.log('key' , key);
console.log("secret" , secret);

const axios = require('axios');
const FormData = require('form-data');

export const uploadJSONToIPFS = async(JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    //making axios POST request to Pinata ⬇️

    return axios 
        .post(url, JSONBody, {
            headers: {
                'Content-Type': `application/json`,
                'Authorization': `Bearer ${jwt}`
              }
        })
        .then(function (response) {
           return {
               success: true,
               pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log("========+++++",error)
            return {
                success: false,
                message: error.message,
            }

    });
};

export const uploadFileToIPFS = async(file) => {
    const formData = new FormData();
  
    formData.append('file', file)
    
    const pinataMetadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);
    
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${jwt}`
        }
      });
       return {
        success: true,
        pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash
    };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
    }
    }
   
};