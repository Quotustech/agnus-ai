// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;
    address payable owner;
    uint256 listPrice = 0.01 ether;

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    event TokenListedSuccess (
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );

    mapping(uint256 => ListedToken) idToListedToken;

    constructor() ERC721("NFTMarketplace", "NFTM") {
        owner = payable(msg.sender);
    }

    function updateListPrice(uint256 _listPrice) public payable {
        require(owner == msg.sender, "Only owner can update listing price");
        listPrice = _listPrice;
    }

    function getListPrice() public view returns (uint256) {
        return listPrice;
    }

    function getLatestIdToListedToken() public view returns (ListedToken memory) {
        uint256 currentTokenId = _tokenIds.current();
        return idToListedToken[currentTokenId];
    }

    function getListedTokenForId(uint256 tokenId) public view returns (ListedToken memory) {
        return idToListedToken[tokenId];
    }

    function getCurrentToken() public view returns (uint256) {
        return _tokenIds.current();
    }


function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
    _tokenIds.increment();
    uint256 newTokenId = _tokenIds.current();
    _safeMint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, tokenURI);
    createListedToken(newTokenId, price);
    return newTokenId;
}


    function createListedToken(uint256 tokenId, uint256 price) private {
        require(msg.value == listPrice, "Incorrect listing price");
        require(price > 0, "Price must be greater than zero");

        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

       _transfer(msg.sender, address(this), tokenId);
        emit TokenListedSuccess(
            tokenId,
            address(this),
            msg.sender,
            price,
            true
        );
    }

    function getAllNFTs() public view returns (ListedToken[] memory) {
        uint nftCount = _tokenIds.current();
        uint listedCount = 0;

        for(uint i = 0; i < nftCount; i++) {
            if(idToListedToken[i + 1].currentlyListed) {
                listedCount++;
            }
        }

        ListedToken[] memory tokens = new ListedToken[](listedCount);
        uint currentIndex = 0;

        for(uint i = 0; i < nftCount; i++) {
            if(idToListedToken[i + 1].currentlyListed) {
                tokens[currentIndex] = idToListedToken[i + 1];
                currentIndex++;
            }
        }
        return tokens;
    }

    function getMyNFTs() public view returns (ListedToken[] memory) {
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0; i < totalItemCount; i++) {
            if(idToListedToken[i + 1].owner == msg.sender || idToListedToken[i + 1].seller == msg.sender){
                itemCount++;
            }
        }

        ListedToken[] memory items = new ListedToken[](itemCount);
        for(uint i = 0; i < totalItemCount; i++) {
            if(idToListedToken[i + 1].owner == msg.sender || idToListedToken[i + 1].seller == msg.sender) {
                uint currentId = i + 1;
                items[currentIndex] = idToListedToken[currentId];
                currentIndex++;
            }
        }
        return items;
    }

    function executeSale(uint256 tokenId) public payable {
        uint price = idToListedToken[tokenId].price;
        address seller = idToListedToken[tokenId].seller;
        require(msg.value == price, "Please submit the asking price to complete the purchase");

        idToListedToken[tokenId].owner = payable(msg.sender);
        idToListedToken[tokenId].currentlyListed = false;
        idToListedToken[tokenId].seller = payable(msg.sender);
        _itemsSold.increment();

        IERC721(address(this)).transferFrom(address(this), msg.sender, tokenId);
        payable(owner).transfer(listPrice);
        payable(seller).transfer(msg.value);
    }

    function listNFT(uint256 tokenId, uint256 newPrice) public payable {
        require(idToListedToken[tokenId].seller == msg.sender, "You are not the owner of this NFT");
        require(newPrice > 0, "Price must be greater than zero");

        idToListedToken[tokenId].price = newPrice;
        idToListedToken[tokenId].currentlyListed = true;
        idToListedToken[tokenId].owner = payable(address(this));

        _transfer(msg.sender, address(this), tokenId);
    }
}
