// server/index.js

const express = require("express");
const cors = require('cors');
// import { BlockFrostAPI } from '@blockfrost/blockfrost-js'; // using import syntax

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(cors());

const Blockfrost = require('@blockfrost/blockfrost-js');

const API = new Blockfrost.BlockFrostAPI({projectId: 'mainnetQR7NJQ9nDQWLnM5cSLXJHQraJmG7PvC2',});

class Policies {
  static Lunars = '0deb40ad7feaea39d92b8c86bc256bf1348db6b239fda9d3be74d30a';
  static DarkLunars = '210d56f86155b426535a5d6e02528ffd73ba595217a374a67430ea5d';
  static SpaceLunars = '3e4c5df851d2186190e9b3fb70f6059809a7a8efa3c708fad02baaeb';
  static CypherkicksLunars = '8f4cfc7bfc391b1aca143f967a7c84b231d75da4df25be3ba1c6ff81';
}

async function getStakeAddress(address)
{
	try
	{
		const addressInfo = await API.addresses(address);
		console.log('stake_address', addressInfo.stake_address);
		
		return addressInfo.stake_address;
	}
	catch (err)
	{
		console.log('error', err);
  }
}

async function assetByPolicy(policy)
{
   try
	{
    const assets = await API.assetsPolicyByIdAll(policy)
		//console.log('assets', assets);		
		return assets;
	
  }
	catch (err)
	{
		console.log('error', err);
  }
}

async function getAllAssets(stakeAddress)
{
  try
	{
		const assets = await API.accountsAddressesAssets(stakeAddress);
		//console.log('assets', assets);		
		return assets;
	
  }
	catch (err)
	{
		console.log('error', err);
  }
}

function countNFTsByPolicyId(assets, policyID)
{
	var count=0;
	for (const a of assets)
	{
		if(a.unit.includes(policyID))
		{
			count++;
		}
	}
	
	return count;
}

async function getIPFSPath(assets)
{
  var ipfs = [];
  console.log('getIPFSPath', 'startipds');
  var count=0;
  for (const a of assets)
  {
    var data = await API.assetsById(a.asset);
    ipfs.push(data.onchain_metadata.image);
    console.log('count', count);
    count++;
  }
  
  console.log('getIPFSPath', 'getIPFSPath');
  
  return ipfs;
}

async function getNFTsByPolicyId(assets, policyID)
{
	var nfts = [];
	for (const a of assets)
	{		
		if(a.unit.includes(policyID))
		{
			let assetInfo = await API.assetsById(a.unit);
			const nft = { asset:assetInfo.asset, metadata:JSON.stringify(assetInfo.onchain_metadata) };
			
			nfts.push(nft);
		}
	}
	
	return nfts;
}

app.get("/lunars", async (req, res) =>
{
	const stakeAddress = await getStakeAddress(req.query.wallet_address);
	const assets = await getAllAssets(stakeAddress);
	
	const l = await getNFTsByPolicyId(assets, Policies.Lunars);
	console.log('lunars', l);
	const dl = await getNFTsByPolicyId(assets, Policies.DarkLunars);
	const sl = await getNFTsByPolicyId(assets, Policies.SpaceLunars);
	const cl = await getNFTsByPolicyId(assets, Policies.CypherkicksLunars);
	
	response = {
      lunars:l,
      dark_lunars:dl,
			space_lunars:sl,
			cypherkicks_lunars:cl
   };
	 
	 console.log(response);
   res.end(JSON.stringify(response));
});

app.get("/count", async (req, res) =>
{
	console.log("/count");
	const stakeAddress = await getStakeAddress(req.query.wallet_address);
	const assets = await getAllAssets(stakeAddress);
	
	const l = countNFTsByPolicyId(assets, Policies.Lunars);
	console.log('lunars', l);
	const dl = countNFTsByPolicyId(assets, Policies.DarkLunars);
	const sl = countNFTsByPolicyId(assets, Policies.SpaceLunars);
	const cl = countNFTsByPolicyId(assets, Policies.CypherkicksLunars);
	
	response = {
      lunars:l,
      dark_lunars:dl,
			space_lunars:sl,
			cypherkicks_lunars:cl
   };
   console.log(response);
   res.end(JSON.stringify(response));
});

app.get("/api", async (req, res) =>
{
  address = 'addr1q84068qgrnqksy3c7gawrvwm0g0ws863grpncftvj5f5h2jq00vzctqeeyyrgk7rgg6nzgqyj258mk6m3a94wnwey6zs2rk57k';
	const stakeAddress = await getStakeAddress(address);
  const assets = await getAllAssets(stakeAddress);
	
  res.json(assets);
});

app.get("/lunarsipfs", async (req, res) =>
{
  const assets = await assetByPolicy(Policies.Lunars);
  const data = await getIPFSPath(assets);
	
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});