////////////////////////////////////////////////
// description : Main react application
// author : Hacket(hacketcrypto@gmail.com)
////////////////////////////////////////////////

import React, { Component, useState } from 'react';
import Wallet from "@harmonicpool/cardano-wallet-interface"; // Todo remove package
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'
import SplitButton from 'react-bootstrap/SplitButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import {  
  Ed25519KeyHash,
  Address
} from "@emurgo/cardano-serialization-lib-asmjs";

import { Buffer } from "buffer";

import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css"

// Create URL with parameters
function createURL(address, data) {
	var url = new URL(address);
	for (let k in data) { url.searchParams.append(k, data[k]); }
	return url;
}

function truncateAddress(a)
{
  var i = 7;
  var j = 7;
  var s1 = a.substring(0,i);
  var s2 = a.substring(a.length-j);
  return s1+"..."+s2;
}

// Count the lunars on the backend
async function countLunars(address)
{	
	var params = {wallet_address:address};

	try
  {
		const res = await fetch(createURL('http://localhost:3001/count', params)); 
		if (res.ok)
		{
			const data = await res.json();
			document.write("Your wallet contains " + data.lunars + " lunars, " + data.dark_lunars + " dark lunars, " + data.space_lunars + " space lunars, " + data.cypherkicks_lunars + " cypherkicks lunars");
		}
		else
		{
			document.write("nope");
		}
	}
	catch (error)
  {
		document.write(error);
	}
}

// Get the lunars on the backend
async function getLunars(address)
{	
	var params = {wallet_address:address};

	try
  {
		const res = await fetch(createURL('http://localhost:3001/lunars', params)); 
		if (res.ok)
		{
			const data = await res.json();
			document.write("Your wallet contains " + data.lunars.length + " lunars, " + data.dark_lunars.length + " dark lunars, " + data.space_lunars.length + " space lunars, " + data.cypherkicks_lunars.length + " cypherkicks lunars");
		}
		else
		{
			document.write("nope");
		}
	}
	catch (error)
  {
		document.write(error);
	}
}

// Cardano wallet providers using Cip30 api
const Provider = 
{
  Nami : "nami",
  Eternl : "eternl",
  Yoroi : "yoroi",
  Gero : "gero",
  Flint : "flint",
  Typhon : "typhon",
  CWallet : "cwallet",
  Nufi : "nufi"
};

// Class to communicate with injected cardano wallets
class CardanoWallet
{
  // Return the wallet base API according to Cardano CIP-30
	static getBaseWalletAPI(provider)
	{
		switch(provider)
    {
      case Provider.Nami:               
          return window.cardano.nami;
      case Provider.Eternl:            
          return window.cardano.eternl;
      case Provider.Flint:
          return window.cardano.flint;
      case Provider.Yoroi:              
          return window.cardano.yoroi;
      case Provider.Gero:               
          return window.cardano.gerowallet;
      case Provider.Typhon:
          return window.cardano.typhon;
      case Provider.CWallet:
          return window.cardano.cardwallet;
      case Provider.Nufi:
          return window.cardano.nufi;
      default:
        return undefined;
    }
	}
	
	static async addressToBeck32(a)
	{
		return await Address.from_bytes(Buffer.from(a, "hex")).to_bech32();
	}
	
	static async getAddress(wallet)
	{
		let a = await wallet.getChangeAddress();
		return await this.addressToBeck32(a);
	}
	
	static isAvailable(provider)
	{
		return this.getWallet(provider) !== undefined;
	}
	
	static getIcon(provider)
	{
		switch(provider)
    {
      case Provider.Nami:               
          return "wallets/nami.svg";
      case Provider.Eternl:            
          return "wallets/eternl.svg";
      case Provider.Flint:
          return "wallets/flint.svg";
      case Provider.Yoroi:              
          return "wallets/yoroi.svg";
      case Provider.Gero:               
          return "wallets/gero.svg";
      case Provider.Typhon:
          return "wallets/typhon.svg";
      case Provider.CWallet:
          return "wallets/cwallet.svg";
      case Provider.Nufi:
          return "wallets/nufi.svg";
      default:
        return undefined;
    }
	}

  // Enable the wallet and return the full wallet API according to Cardano CIP-30
	static async enable(wallet)
	{
		if(wallet !== undefined)
		{
      return await wallet.enable();
		}
    
    return undefined;
	}
  
  static isEnabled(wallet)
  {
    return wallet !== undefined;
  }
  
  // Return the full wallet API according to Cardano CIP-30
  static async getFullWalletAPI(provider)
  {
    let wallet = this.getBaseWalletAPI(provider);
    wallet = await CardanoWallet.enable(wallet);
    return wallet;
  }
}

// The wallet selector dropdown button
class CardanoWalletSelector extends Component
{
  constructor(props)
  {
    super(props);
    this.handleWallet = this.handleWallet.bind(this);
    this.state = {title: false, title: "Connect Wallet", icon: "wallets/cardano.svg"};
  }
  
  setWallet(c, t, i, w)
  {
    this.setState(
      {
        isConnected: c,
        title: truncateAddress(t),
        icon: i,
        wallet: w
      }
    );
  }
  
	render()
  {
		const enableWallet = async (provider) => 
		{
      var title = "Connect Wallet";
      var icon = "wallets/cardano.svg";   
      
      // Get the enabled cardano wallet
			let wallet = await CardanoWallet.getFullWalletAPI(provider);
      var isEnabled = wallet !== undefined;
      
      if(isEnabled)
      {
        // If wallet is enabled, Change the button appearance
        title = await CardanoWallet.getAddress(wallet);
        icon = CardanoWallet.getIcon(provider);
      }
      
      // Set the wallet state
      this.setWallet(isEnabled, title, icon, wallet);
      
      // Pass the wallet state to the navigation component
      this.props.handleWallet(this.state.isConnected, this.state.wallet);
		}	

		return (
      <DropdownButton id="wallet-dropdown" size="lg" title={<span><img class="wallet-selected-logo" src={this.state.icon} alt="Nami"/> {this.state.title}</span>} onSelect={enableWallet}>
        <Container>
          <Row>
            <Col className="px-0 text-center"><Dropdown.Item eventKey="nami"><img class="wallet-logo" src="wallets/nami.svg" alt="Nami"/></Dropdown.Item></Col>
            <Col className="px-0 text-center"><Dropdown.Item eventKey="eternl"><img class="wallet-logo" src="wallets/eternl.svg" alt="Nami"/></Dropdown.Item></Col>
            <Col className="px-0 text-center"><Dropdown.Item eventKey="flint"><img class="wallet-logo" src="wallets/flint.svg" alt="Nami"/></Dropdown.Item></Col>						  
          </Row>
          <Row>
            <Col className="px-0 text-center"><Dropdown.Item eventKey="gero"><img class="wallet-logo" src="wallets/gero.svg" alt="Nami"/></Dropdown.Item></Col>
            <Col className="px-0 text-center"><Dropdown.Item eventKey="yoroi"><img class="wallet-logo" src="wallets/yoroi.svg" alt="Nami"/></Dropdown.Item></Col>
            <Col className="px-0 text-center"><Dropdown.Item eventKey="typhon"><img class="wallet-logo" src="wallets/typhon.svg" alt="Nami"/></Dropdown.Item></Col>	
          </Row>
          <Row>
            <Col className="px-0 text-center"><Dropdown.Item eventKey="cwallet"><img class="wallet-logo" src="wallets/cwallet.svg" alt="Nami"/></Dropdown.Item></Col>
            <Col className="px-0 text-center"><Dropdown.Item eventKey="nufi"><img class="wallet-logo" src="wallets/nufi.svg" alt="Nami"/></Dropdown.Item></Col>
            <Col className="px-0 text-center"><Dropdown.Item eventKey="other"></Dropdown.Item></Col>	
          </Row>
        </Container>
      </DropdownButton>
		);		
	}
}

const Page = 
{
  Landing : "nami",
  Roadmap : "eternl",
  Dashboard : "yoroi"
};

// Top menu
class Menu extends Component
{
  constructor(props)
  {
    super(props);
    this.handleWallet = this.handleWallet.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
    this.state = {page: Page.Landing, isWalletConnected: false};
  }
  
  setNavigation(c, p)
  {
    this.setState(
      {
        isWalletConnected: c,
        page: p
      }
    );
  }
  
  setWalletConnection(c)
  {
    this.setState({isWalletConnected: c});
  }
  
  setSelectedPage(p)
  {
    this.setState({page: p});
    
    // Pass the navigation state to the main component
    this.props.handleNavigation(this.state.page);
  }
  
  handleWallet(isConnected, wallet)
  {
    var currentPage = this.state.page;
    if(isConnected)
    {
      // If wallet connected, switch page to dashboard
      this.setNavigation(isConnected, Dashboard);
    }
    
    // Pass the wallet state to the main component
    this.props.handleWallet(wallet);
  }
  
  render()
  {
    return(
      <Navbar collapseOnSelect expand="sm" variant="dark" fixed="top">
        <Container fluid className="mx-3">
          <Navbar.Brand href="#home">LUNARS</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
            <Nav.Link href="#features">Home</Nav.Link>
            <Nav.Link href="#pricing">Roadmap</Nav.Link>            
            </Nav>                    
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

// Bottom page footer
class Footer extends Component
{
  render()
  {
    return(
      <Container fluid className="fixed-bottom py-2 mx-0">
        <Row>
        <Col></Col>
        <Col xs={6} className="text-center"><h2 class="m-0 blink">CONNECT WALLET TO ENTER THE DAO</h2></Col>
        <Col className="d-flex flex-row-reverse py-0 mx-0">
          <div><img class="link-logo" src="twitter.svg"  alt="" /></div>
          <div><img class="link-logo" src="discord.svg"  alt="" /></div>
        </Col>
        </Row>
      </Container>	      
    );
  }
}

class Landing extends Component
{
  render()
  {
    return(
      <div>
        Landing
      </div>     
    );
  }
}

class Roadmap extends Component
{
  render()
  {
    return(
      <div>
        Roadmap
      </div>    
    );
  }
}

class Dashboard extends Component
{
  render()
  {
    return(
    <div>
        Dashboard
    </div>
    );
  }
}

// The Main component
class Main extends Component
{
  constructor(props)
  {
    super(props);
    this.handleWallet = this.handleWallet.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
    this.state = {page: Page.Landing, wallet: undefined};
    this.state = {}
  }
  
  handleWallet(w)
  {
    this.setState({wallet: w});
  }
  
  handleNavigation(p)
  {
    this.setState({page: p});
  }
  
  render()
  {
    return(
      <div>
        <Menu></Menu>
        <Footer></Footer>
        <img src = "lunars2.svg" class = "fullscreen" alt="My Happy SVG"/>
      </div>
    );
  }
}

// The main application
class App extends Component
{
  constructor(props)
  {
    super(props);
    this.state = {}
  }
    
  async componentDidMount()
  {
    //await Wallet.enable( Wallet.Names.Nami );   
  }
  render()
  {   
    return(	
      <Main></Main>	
    );
  }
}

export default App;