import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { ethers } from 'ethers';

export default function NFTPage(props) {
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");
  const [listingPrice, setListingPrice] = useState('');

  async function addToCart(tokenId) {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartItems.includes(tokenId)) {
      alert('NFT is already added to the cart!');
      return;
    }
    cartItems.push(tokenId);
    console.log(tokenId);
    localStorage.setItem('cart', JSON.stringify(cartItems.map(item => item)));
    alert('Item added to cart!');
  }

  const handleReListNFT = async () => {
    try {
      console.log('tokenId:', tokenId);
      if (!listingPrice || isNaN(listingPrice) || parseFloat(listingPrice) <= 0) {
        alert('Please enter a valid listing price.');
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
  
      let transaction = await contract.listNFT(tokenId, ethers.utils.parseUnits(listingPrice, 'ether'), { value: await contract.getListPrice() });
      console.log('Transaction:', transaction);
      await transaction.wait();
      alert('Your NFT has been listed successfully!');
  
      // Reset dataFetched to false before fetching NFT data again
      updateDataFetched(false);
      await getNFTData(tokenId);
      
      setTimeout(() => {
        console.log(data.price);
      }, 10000); 
    } catch (e) {
      alert('Error listing the NFT: ' + e);
    }
  };

  async function getNFTData(tokenId) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      console.log(addr);

      let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

      // Fetch NFT details from the blockchain
      const listedToken = await contract.getListedTokenForId(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const meta = await axios.get(GetIpfsUrlFromPinata(tokenURI));
      console.log("getNFTdata is called");

      let item = {
        price: ethers.utils.formatUnits(listedToken.price, 'ether'), // Fetch price from blockchain
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      };
      console.log(item.price);

      updateData(item);
      updateDataFetched(true);
      updateCurrAddress(addr);
    } catch (error) {
      console.error('Error fetching NFT data:', error);
      // Handle error
    }
  }

  async function buyNFT(tokenId) {
    console.log(data.price)
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
      const salePrice = ethers.utils.parseUnits(data.price, 'ether');
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
      let transaction = await contract.executeSale(tokenId, { value: salePrice });
      await transaction.wait();
      alert('You successfully bought the NFT!');
      updateMessage("");
    } catch (e) {
      alert("Upload Error" + e);
    }
  }

  const params = useParams();
  const tokenId = params.tokenId;

  if (!dataFetched)
    getNFTData(tokenId);

  if (typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0">
          <img src={data.image} alt="" className="w-full md:w-2/5 rounded-lg shadow-lg" />
          <div className="md:ml-10 md:w-3/5 space-y-4 text-white shadow-2xl rounded-lg border-2 p-5">
            <div>
              <span className="font-semibold">Name:</span> {data.name}
            </div>
            <div>
              <span className="font-semibold">Description:</span> {data.description}
            </div>
            <div>
              <span className="font-semibold">Price:</span> <span className="">{data.price} AGN</span>
            </div>
            <div>
              <span className="font-semibold">Owner:</span> <span className="text-sm">{data.owner}</span>
            </div>
            <div>
              <span className="font-semibold">Seller:</span> <span className="text-sm">{data.seller}</span>
            </div>
            <div>
              <div>
                <div>
                </div>
              </div>
              {currAddress !== data.owner && currAddress !== data.seller ? (
                <button className="enableEthereumButton bg-gray-900 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
              ) : (
                <div className="text-green-700">You are the owner of this NFT</div>
              )}
            </div>
            {currAddress === data.seller && <div className="mt-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="listingPrice">
                Enter Listing Price (AGN):
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="listingPrice"
                type="number"
                placeholder="e.g., 0.1"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
              />
              <button onClick={handleReListNFT} className="bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2">
                List NFT
              </button>
            </div>}
            <div className="text-green text center mt-3">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
