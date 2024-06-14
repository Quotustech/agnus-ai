import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import MarketplaceJSON from '../Marketplace.json';
import { useLocation } from "react-router";

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const location = useLocation();

    async function disableButton() {
        const listButton = document.getElementById("list-button");
        listButton.disabled = true;
        listButton.style.opacity = 0.3;
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button");
        listButton.disabled = false;
        listButton.style.backgroundColor = "#A500FF";
        listButton.style.opacity = 1;
    }

    async function OnChangeFile(e) {
        var file = e.target.files[0];
        try {
            disableButton();
            updateMessage("Uploading image.. please don't click anything!");
            const response = await uploadFileToIPFS(file);
            if(response.success === true) {
                enableButton();
                updateMessage("");
                console.log("Uploaded image to Pinata: ", response.pinataURL);
                setFileURL(response.pinataURL);
            }
        }
        catch(e) {
            console.log("Error during file upload", e);
        }
    }

    async function uploadMetadataToIPFS() {
        const { name, description, price } = formParams;
        if(!name || !description || !price || !fileURL) {
            updateMessage("Please fill all the fields!");
            return -1;
        }

        const nftJSON = { name, description, price, image: fileURL };

        try {
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true) {
                console.log("Uploaded JSON to Pinata: ", response);
                return response.pinataURL;
            }
        }
        catch(e) {
            console.log("Error uploading JSON metadata:", e);
        }
    }

    async function listNFT(e) {
        e.preventDefault();

        try {
            const metadataURL = await uploadMetadataToIPFS();
            if(metadataURL === -1) return;

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const signerAddress = await signer.getAddress();
            console.log("Signer Address:", signerAddress);

            disableButton();
            updateMessage("Uploading NFT (takes 5 mins).. please don't click anything!");

            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            console.log("Contract Address:", contract.address);

            const price = ethers.utils.parseUnits(formParams.price, 'ether');
            let listingPrice = await contract.getListPrice();
            listingPrice = listingPrice.toString();
            console.log("Listing Price:", listingPrice);

            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice });
            console.log("Transaction:", transaction);
            await transaction.wait();

            alert("Successfully listed your NFT!");
            enableButton();
            updateMessage("");
            updateFormParams({ name: '', description: '', price: '' });
            window.location.replace("/");
        } catch(e) {
            console.error("Upload error", e);
            alert("Upload error: " + (e.message || e));
        }
    }

    return (
        <div className="bg-gray-900 min-h-screen">
            <Navbar></Navbar>
            <div className="flex flex-col items-center mt-10 px-4 sm:px-0" id="nftForm">
                <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4 w-full max-w-lg">
                    <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                    <div className="mb-4">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="AgnusAi#01" onChange={e => updateFormParams({ ...formParams, name: e.target.value })} value={formParams.name}></input>
                    </div>
                    <div className="mb-6">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                        <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="AgnusAi Collection" value={formParams.description} onChange={e => updateFormParams({ ...formParams, description: e.target.value })}></textarea>
                    </div>
                    <div className="mb-6">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Price (in AGN)</label>
                        <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 AGN" step="0.01" value={formParams.price} onChange={e => updateFormParams({ ...formParams, price: e.target.value })}></input>
                    </div>
                    <div>
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                        <input type={"file"} onChange={OnChangeFile}></input>
                    </div>
                    <br></br>
                    <div className="text-red-500 text-center">{message}</div>
                    <button onClick={listNFT} className="font-bold mt-10 w-full bg-blue-500 text-white rounded p-2 shadow-lg" id="list-button">
                        List NFT
                    </button>
                </form>
            </div>
        </div>
    );
}
