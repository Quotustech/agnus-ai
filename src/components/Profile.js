import Navbar from "./Navbar";
import { useState, useEffect } from "react";
// import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import NFTTile from "./NFTTile";

export default function Profile() {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [activeTab, setActiveTab] = useState("Collected");

    async function getCartItems() {
       
        let cartItemIds = JSON.parse(localStorage.getItem('cart')) || [];
        let nftData = [];
        
      
      
        // Loop through each token ID in the cart
        for (let i = 0; i < cartItemIds.length; i++) {
          let tokenId = cartItemIds[i];
          let nft = await getNFTData(tokenId); // Fetch NFT data for the current token ID
          nftData.push(nft); // Add fetched NFT data to the array 
        }
        return nftData; // Return an array of NFT data for items in the cart
      }

    async function getNFTData() {
       
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        let transaction = await contract.getMyNFTs();
        
        const items = await Promise.all(transaction.map(async i => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            let meta = await axios.get(tokenURI);
            meta = meta.data; 
            let item = {
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
                price: ethers.utils.formatEther(i.price)
            }
            return item;
        }));

        updateData(items);
        updateFetched(true);
        updateAddress(addr);
    }

    useEffect(() => {
        if (!dataFetched) getNFTData();
    }, []);

    const filteredData = data.filter(item => {
        if (activeTab === "Cart") {
            return item.owner.toLowerCase() === address.toLowerCase();
        }
        if (activeTab === "Activity") {
            return item.owner.toLowerCase() !== address.toLowerCase();
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center space-y-8 text-white">
                    <ul className="flex space-x-4">
                        {/* <li onClick={() => { getCartItems(); setActiveTab("Cart"); }} className={`cursor-pointer ${activeTab === "Cart" ? 'text-blue-500' : 'text-white'}`}>Cart</li> */}
                        <li onClick={() => setActiveTab("Collected")} className={`cursor-pointer ${activeTab === "Collected" ? 'text-blue-500' : 'text-white'}`}>Collected {data.length} </li>
                        {/* <li onClick={() => setActiveTab("Activity")} className={`cursor-pointer ${activeTab === "Activity" ? 'text-blue-500' : 'text-white'}`}>Activity</li> */}
                    </ul>
                    {activeTab === "Collected" && <div className="text-center">
                        <div className="flex justify-center gap-3 flex-wrap max-w-screen-xl">
                            {filteredData.length > 0 ? (
                                filteredData.map((value, index) => {
                                    return <NFTTile data={value} key={index} ></NFTTile>;
                                })
                            ) : (
                                <div className="mt-4 text-xl">
                                    No NFTs found.
                                </div>
                            )}
                        </div>
                    </div>}
                    {activeTab === "Cart" && <div className="text-center">
                        <div className="flex justify-center gap-3 flex-wrap max-w-screen-xl">
                            {filteredData.length > 0 ? (
                                filteredData.map((value, index) => {
                                    return <NFTTile data={value} key={index} ></NFTTile>;
                                })
                            ) : (
                                <div className="mt-4 text-xl">
                                    No NFTs found.
                                </div>
                            )}
                        </div>
                    </div>}
                    {activeTab === "Activity" && <div className="text-center">
                        Activity
                        <table className=""  >
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Time</th>
                            </tr>
                            <td>one</td>
                            <td>two</td>
                            <td>three</td>
                        </table>
                    </div>}
                </div>
            </div>
        </div>
    );
}
