import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import NFTTile from "./NFTTile";

export default function Profile(props) {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [activeTab, setActiveTab] = useState("Collected");

    async function getNFTData() {
        const ethers = require("ethers");

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            updateAddress(addr);

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
        } catch (error) {
            console.error("Error fetching NFTs:", error);
        }
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
                        <li onClick={() => setActiveTab("Collected")} className={`cursor-pointer ${activeTab === "Collected" ? 'text-blue-500' : 'text-white'}`}>
                            Collected {data.length}
                        </li>
                    </ul>
                    {activeTab === "Collected" && (
                        <div className="text-center">
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
