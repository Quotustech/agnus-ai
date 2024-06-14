// import logo from '../logo_3.png';
// import fullLogo from '../full_logo.png';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { GiHamburgerMenu } from "react-icons/gi";
import { IoIosClose } from "react-icons/io";

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState('0x');
  const [menuOpen, setMenuOpen] = useState(false);

  async function getAddress() {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
      updateAddress(addr);
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  }

  function updateButton() {
    const ethereumButton = document.querySelector('.enableEthereumButton');
    ethereumButton.textContent = "Connected";
    ethereumButton.classList.remove("hover:bg-blue-70");
    ethereumButton.classList.remove("bg-blue-500");
    ethereumButton.classList.add("hover:bg-green-70");
    ethereumButton.classList.add("bg-green-500");
  }

  async function connectWebsite() {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x44C') {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x44C',
            chainName: 'Agnus AI',
            nativeCurrency: {
              name: 'Agnus',
              symbol: 'AGN',
              decimals: 18
            },
            rpcUrls: ['https://rpc.agnscan.com'],
            blockExplorerUrls: ['https://explorer.agnscan.com']
          }]
        }).catch((error) => {
          console.error('Failed to add chain:', error);
        });
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(() => {
          updateButton();
          getAddress();
          
        }).catch((err) => {
          console.log('Failed to request accounts:', err);
        });
    } catch (error) {
      console.log('Failed to connect:', error);
    }
  }

  useEffect(() => {
    if (window.ethereum === undefined)
      return;
    let val = window.ethereum.isConnected();
    if (val) {
      getAddress();
      toggleConnect(val);
      updateButton();
    }

    window.ethereum.on('accountsChanged', function (accounts) {
      window.location.replace(location.pathname)
    })
  }, []);

  return (
    <div className="relative">
      <nav className="w-screen flex items-center text-white border-b border-gray-800 p-4 bg-gray-900 relative">
        {/* logo */}
        <div className="flex items-center">
          <Link to="/">
            <img src="ai.png" alt="logo" width={40} height={40} className="inline-block -mt-2" />
            <div className='inline-block font-bold text-xl ml-2'>
              Agnus AI
            </div>
          </Link>
        </div>
        {/* toggle buttons */}
        <div className="ml-auto lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <IoIosClose size={24} /> : <GiHamburgerMenu size={24} />}
        </div>
        {/* nav options */}
        <div className={`lg:flex ${menuOpen ? 'block' : 'hidden'} w-[96%] lg:w-auto lg:items-center lg:ml-auto  absolute lg:relative -bottom-[13rem] lg:bottom-0 bg-gray-900`}>
          <ul className='lg:flex justify-between font-bold text-lg lg:space-x-6'>
            <li className={`p-2 ${location.pathname === "/" ? 'border-b-2' : 'hover:border-b-2'}`}>
              <Link to="/">Marketplace</Link>
            </li>
            <li className={`p-2 ${location.pathname === "/sellNFT" ? 'border-b-2' : 'hover:border-b-2'}`}>
              <Link to="/sellNFT">List My NFT</Link>
            </li>
            <li className={`p-2 ${location.pathname === "/profile" ? 'border-b-2' : 'hover:border-b-2'}`}>
              <Link to="/profile">Profile</Link>
            </li>
          </ul>
          <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm mt-2 lg:mt-0 lg:ml-4" onClick={connectWebsite}>{connected ? "Connected" : "Connect"}</button>
          <div className='text-white font-bold text-right text-sm mt-2 lg:mt-0 lg:ml-4 p-1'>
            {currAddress !== "0x" ? `Connected to ${currAddress.substring(0, 15)}...` : ""}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
