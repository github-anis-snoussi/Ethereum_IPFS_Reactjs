import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import ipfs from './ipfs'

import "./App.css";
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ipfsHash: '',
      web3: null,
      buffer: null,
      accounts: null,
      contract: null
    }
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.initValue = this.initValue.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.initValue);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  initValue = async () => {
    const { contract } = this.state;

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ ipfsHash: response });
  };


  captureFile(event) {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  onSubmit(event) {
    
    const { contract, accounts } = this.state;

    event.preventDefault()
    ipfs.files.add(this.state.buffer, async (error, result) => {
      if(error) {
        console.error(error)
        return
      }
      console.log("ipfsHash : " , result[0].hash)

      await contract.methods.set(result[0].hash).send({ from: accounts[0] });

      this.setState({ ipfsHash: result[0].hash })

    })
  }

  render() {
    return (
      <div className="App">
        <nav>
          <h1>IPFS File Upload DApp</h1>
        </nav>

        <main className="container">

          <h1>Your Image</h1>

          <p>This image is stored on IPFS & The Ethereum Blockchain!</p>
          <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/>

          <h2>Upload Image</h2>
          <form onSubmit={this.onSubmit} >
            <input type='file' onChange={this.captureFile} />
            <input type='submit' />
          </form>

        </main>
      </div>
    );
  }
}

export default App
