// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage {
    // NFT variable
    uint256 private s_tokenId;

    // Events
    event nftCreated(address to, uint256 tokenId, string tokenURI);

    // Constructor
    constructor() ERC721("MyNFT", "MNFT") {
        s_tokenId = 0;
    }

    ////////////////////
    // Main Functions //
    ////////////////////

    /**
     * @notice Create a new NFT
     * @param tokenURI : URI of the token
     * @dev This function increment the token ID each time before minting the token for caller's address and setting the tokenURI
     */
    function createNFT(string calldata tokenURI) external {
        s_tokenId++;
        _safeMint(msg.sender, s_tokenId);
        _setTokenURI(s_tokenId, tokenURI);
        emit nftCreated(msg.sender, s_tokenId, tokenURI);
    }

    ////////////////////
    // View Functions //
    ////////////////////
    function getTokenId() external view returns (uint256) {
        return s_tokenId;
    }
}
