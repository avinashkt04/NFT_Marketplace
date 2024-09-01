// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error NFTMarket__InvalidAddress();
error NFTMarket__NotOwner();
error NFTMarket__AlreadyListed();
error NFTMarket__NotListed();
error NFTMarket__InvalidPrice();
error NFTMarket__NotApproved();
error NFTMarket__PriceNotMet();
error NFTMarket__NoProceeds();
error NFTMarket__TransferFailed();

contract NFTMarket is  ReentrancyGuard {
    // Structs
    struct Listing {
        address seller;
        uint256 price;
    }

    // Mapping
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    // Events
    event nftListed(
        address seller,
        address nftAddress,
        uint256 tokenId,
        uint256 price
    );
    event nftBought(
        address buyer,
        address nftAddress,
        uint256 tokenId,
        uint256 price
    );
    event nftCancelled(address seller, address nftAddress, uint256 tokenId);

    ////////////////////
    //   Modifiers    //
    ////////////////////
    modifier isERC721(address nftAddress){
        if (nftAddress == address(0)) {
            revert NFTMarket__InvalidAddress();
        }
    
        uint256 size;
        assembly { size := extcodesize(nftAddress) }
    
        if (size == 0) {
            revert NFTMarket__InvalidAddress();
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NFTMarket__NotOwner();
        }
        _;
    }

    modifier notListed(address nftAddress, uint256 tokenId) {
        if (s_listings[nftAddress][tokenId].price != 0) {
            revert NFTMarket__AlreadyListed();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        if (s_listings[nftAddress][tokenId].price == 0) {
            revert NFTMarket__NotListed();
        }
        _;
    }

    ////////////////////
    // Main Functions //
    ////////////////////

    /**
     * @notice List an NFT
     * @param nftAddress : Address of the NFT
     * @param tokenId : ID of the NFT
     * @param price : Price of the NFT
     * @dev This function list the NFT with the given price
     */
    function listNft(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        isERC721(nftAddress)
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NFTMarket__InvalidPrice();
        }
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NFTMarket__NotApproved();
        }
        s_listings[nftAddress][tokenId] = Listing(msg.sender, price);
        emit nftListed(msg.sender, nftAddress, tokenId, price);
    }

    /**
     * @notice Buy an NFT
     * @param nftAddress : Address of the NFT
     * @param tokenId : ID of the NFT
     * @dev This function buy the NFT with the given price
     */
    function buyNft(
        address nftAddress,
        uint256 tokenId
    ) external payable nonReentrant isERC721(nftAddress) isListed(nftAddress, tokenId) {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price) {
            revert NFTMarket__PriceNotMet();
        }
        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            tokenId
        );
        emit nftBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    /**
     * @notice Cancel the listing of an NFT
     * @param nftAddress : Address of the NFT
     * @param tokenId : ID of the NFT
     * @dev This function cancel the listing of the NFT
     */
    function cancelListing(
        address nftAddress,
        uint256 tokenId
    )
        external
        isERC721(nftAddress)
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit nftCancelled(msg.sender, nftAddress, tokenId);
    }

    /**
     * @notice Update the listing of an NFT
     * @param nftAddress : Address of the NFT
     * @param tokenId : ID of the NFT
     * @param newPrice : New price of the NFT
     * @dev This function update the listing of the NFT with the new price
     */
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isERC721(nftAddress)
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        if (newPrice <= 0) {
            revert NFTMarket__InvalidPrice();
        }
        s_listings[nftAddress][tokenId].price = newPrice;
        emit nftListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    /**
     * @notice Withdraw the proceeds
     * @dev This function withdraw the proceeds of the seller
     */
    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds == 0) {
            revert NFTMarket__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: proceeds}("");
        if (!success) {
            revert NFTMarket__TransferFailed();
        }
    }

    /////////////////////
    // Getter Function //
    /////////////////////

    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
