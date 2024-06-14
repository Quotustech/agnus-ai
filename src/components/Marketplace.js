import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useEffect, useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { ethers } from 'ethers';

export default function Marketplace() {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);

    async function requestAccount() {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWalletConnected(true);
        } catch (error) {
            console.log("User rejected account access", error);
        }
    }

    async function getAllNFTs() {
        if (!window.ethereum) {
            console.log("MetaMask is not installed!");
            return;
        }

        try {
            await requestAccount();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress(); // Check if the signer can get the address

            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            let transaction = await contract.getAllNFTs();
            console.log("get all nfts called");

            if (!transaction || transaction.length === 0) {
                // If no NFTs are found, return an empty array
                updateData([]);
                return;
            }

            const items = await Promise.all(transaction.map(async i => {
                var tokenURI = await contract.tokenURI(i.tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;
               
                let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                };
                return item;
            }));
            localStorage.setItem('localNfts', JSON.stringify(items));
            updateFetched(true);
            updateData(items);
        } catch (error) {
            console.error("Error fetching NFTs:", error);
        }
    }
    
    useEffect(() => {
        console.log('get nft called');
        // getAllNFTs();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900"> 
            <Navbar/>
            <div className="container mx-auto px-4 py-12">
                <div className="text-center text-white text-2xl font-bold mb-8">
                    Top NFTs
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {data.length === 0 ? (
                        <div className="text-white text-center col-span-full text-2xl">
                            No NFTs found, Be the First one to List
                        </div>
                    ) : (
                        data.map((value, index) => (
                            <NFTTile data={value} key={index}></NFTTile>
                        ))
                    )}
                </div>
            </div>            
        </div>
    );
}
