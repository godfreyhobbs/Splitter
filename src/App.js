import React, {Component} from 'react';
import './App.css';
import getWeb3 from './utils/getWeb3'
//TODO: move contract build folder
import Splitter from './build/Splitter.json'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
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

    var splitterInstance

    //
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.web3.eth.getBalance(accounts[0],
         function (error, result) {
           if (!error) {
             console.log(JSON.stringify(result))
             this.setState({balance: result.toString()})
             splitter.deployed().then((instance) => {
               splitterInstance = instance
               return splitterInstance.registerDestinationAddr('Carol', {from: accounts[1]});
             }).then((result) => {
                console.log(result)

               // Get the value from the contract to prove it worked.
               return splitterInstance.registerDestinationAddr('Bob', {from: accounts[2]})
             }).then((result) => {
               console.log(result)
               return splitterInstance.send(this.state.web3.toWei(1, "ether"))
             }).then((result) => {
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
    return (
       <div className="App">
         <header className="App-header">
           <h1 className="App-title">Welcome to React</h1>
         </header>
         <p className="App-intro">
           account balance is {this.state.balance}
         </p>
       </div>
    );
  }
}

export default App;
