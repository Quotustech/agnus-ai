import axie from "../tile.jpeg";
import {
    BrowserRouter as Router,
    Link,
  } from "react-router-dom";
  import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile (data) {
    console.log('data' , data)
    const newTo = {
        pathname:"/nftPage/"+data.data.tokenId
    }

    const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

    return (
        <Link to={newTo} className="h-fit" >
        <div className=" flex flex-col border-2 items-center rounded-lg w-48 md:w-72 h-[20rem] shadow-2xl">
            <img src={IPFSUrl} alt="" className="w-72 h-full rounded-lg object-cover" crossOrigin="anonymous" />
            <div className= "text-white w-full p-2 bg-gradient-to-t from-[#] to-transparent rounded-lg pt-5 -mt-20">
                <strong className="text-xl">{data.data.name}</strong>
                <p className="display-inline">
                </p>
                
            </div>
        </div>
        </Link>
    )
}

export default NFTTile;
