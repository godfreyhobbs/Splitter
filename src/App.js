import React, {Component} from 'react';
import './App.css';
import getWeb3 from './utils/getWeb3'
//TODO: move contract build folder
import Splitter from './build/Splitter.json'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      deposit:0,
      numDestinationAddrs: 0,
      destinationAddrs: [],
      balance: 0,
      web3: null
    }
  }

  componentDidMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
       .then(results => {
         this.setState({
           web3: results.web3
         })

         // Instantiate contract once web3 provided.
         this.instantiateContract()
       })
       .catch(() => {
         console.log('Error finding web3.')
       })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const contract = require('truffle-contract')
    const splitter = contract(Splitter)
    splitter.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    this.state.web3.version.getNetwork(console.log)
    
    var splitterInstance

    const carolAddr = '0x05d89562a2b978B06Ba91c1BE137B32BF7CA3310';
    const bobAddr = '0x896838b0fdf2Edd193dF1AE4C5569D9503Ed118A';
    //
    this.state.web3.eth.getAccounts((error, accounts) => {


      this.state.web3.eth.getBalance(accounts[0],
         function (error, result) {
           if (!error) {
             console.log(JSON.stringify(result))
             this.setState({balance: result.toString()})
             splitter.deployed().then((instance) => {
               splitterInstance = instance

               return splitterInstance.numDestinationAddrs();
             }).then((result) => {
               console.log(result)
               this.setState({numDestinationAddrs :result.toString()});

               return splitterInstance.destinationAddrs(carolAddr);
             }).then((result) => {

               if(!result[0]) {
                 return splitterInstance.registerDestinationAddr('Carol', {from: carolAddr});
               } else {
                 return splitterInstance.registerDestinationAddr('Bob', {from: bobAddr});
               }



             }).then((result) => {
                console.log(result)

               // Get the value from the contract to prove it worked.
             //   return splitterInstance.registerDestinationAddr('Bob', {from: '0x5d72eabd566f050294262cf0fee30ee08ec8b00f'})
             // }).then((result) => {
             //   console.log(result)
             //   return splitterInstance.send(this.state.web3.toWei(1, "ether"))
             // }).then((result) => {
               console.log(result)
             })

           }
           else
             console.error(error);
         }.bind(this)
      )
    })


    // Get accounts.
    // this.state.web3.eth.getAccounts((error, accounts) => {
    //   simpleStorage.deployed().then((instance) => {
    //     simpleStorageInstance = instance
    //
    //     // Stores a given value, 5 by default.
    //     return simpleStorageInstance.set(5, {from: accounts[0]})
    //   }).then((result) => {
    //     // Get the value from the contract to prove it worked.
    //     return simpleStorageInstance.get.call(accounts[0])
    //   }).then((result) => {
    //     // Update state with the result.
    //     return this.setState({ storageValue: result.c[0] })
    //   })
    // })
  }

  render() {

    const listAddrs = this.state.destinationAddrs.map((item) =>
       <li>{item}</li>
    );

    return (
       <div className="App">
         <header className="App-header">
           <h1 className="App-title">Welcome to Slitter</h1>
         </header>
         <p className="App-intro">
           Splitter:
           <ul>{listAddrs}</ul>,
           <div>numDestinationAddrs is {this.state.numDestinationAddrs}</div>
           <div>destinationAddrs 1 : {this.state.destinationAddrs[0]}</div>
           <div>account balance is {this.state.balance}</div>
         </p>
       </div>
    );
  }
}

export default App;
