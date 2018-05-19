import React, { Component } from "react";
import _ from "lodash";
import "./App.css";
import getWeb3 from "./utils/getWeb3";
//TODO: move contract build folder
import Splitter from "./build/Splitter.json";

// CONSTANTS
const carolAddr = "0x05d89562a2b978B06Ba91c1BE137B32BF7CA3310";
const bobAddr = "0x896838b0fdf2Edd193dF1AE4C5569D9503Ed118A";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deposit: 0,
      numDestinationAddrs: 0,
      destinationAddrs: [],
      balances: {},
      web3: null,
      splitterInstance: null,
      accounts: [],
      newDepositVal: ""
    };
  }

  componentDidMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        // Instantiate contract once web3 provided.
        this.instantiateContract();
      })
      .catch(() => {
        console.log("Error finding web3.");
      });
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const contract = require("truffle-contract");
    const splitter = contract(Splitter);
    splitter.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    this.state.web3.version.getNetwork(console.log);

    var splitterInstance;

    const carolAddr = "0x05d89562a2b978B06Ba91c1BE137B32BF7CA3310";
    const bobAddr = "0x896838b0fdf2Edd193dF1AE4C5569D9503Ed118A";
    //
    this.state.web3.eth.getAccounts((error, accounts) => {
      splitter
        .deployed()
        .then(instance => {
          splitterInstance = instance;
          this.setState({
            splitterInstance,
            accounts
          });

          this.updateAddrsBalances(
            accounts.concat(carolAddr, bobAddr, instance.address)
          );

          return splitterInstance.numDestinationAddrs();
        })
        .then(result => {
          console.log(result);
          this.setState({ numDestinationAddrs: result.toString() });
          return splitterInstance.destinationAddrs(carolAddr);
        })
        .then(result => {
          //TODO: massive clean up of this init code
          //   if (!result[0]) {
          //     return splitterInstance.registerDestinationAddr("Carol", {
          //       from: carolAddr
          //     });
          //   } else {
          //     return splitterInstance.registerDestinationAddr("Bob", {
          //       from: bobAddr
          //     });
          //   }
          // })
          // .then(result => {
          console.log(result);

          // Get the value from the contract to prove it worked.
          //   return splitterInstance.registerDestinationAddr('Bob', {from: '0x5d72eabd566f050294262cf0fee30ee08ec8b00f'})
          // }).then((result) => {
          //   console.log(result)
          //   return splitterInstance.send(this.state.web3.toWei(1, "ether"))
          // }).then((result) => {
          console.log(result);
        });
    });
  }

  updateAddrsBalances = async accounts => {
    await _.forEach(accounts, async addr => {
      this.state.web3.eth.getBalance(addr, (err, bal) => {
        let newBalances = this.state.balances;
        newBalances[addr] = bal.toString();
        this.setState({ balances: newBalances });
      });
    });
  };

  handleClick = () => {
    console.log("this is:", this);
    this.state.splitterInstance
      .sendTransaction({
        from: this.state.accounts[0],
        value: this.state.web3.toWei(this.state.newDepositVal, "ether")
      })
      .then(console.log);
  };

  depositHandleChange = event => {
    this.setState({ newDepositVal: event.target.value });
  };

  render() {
    const listAddrs = _.map(this.state.balances, (val, key) => (
      <li key={key}>{key} : {val} </li>
    ));

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Slitter</h1>
        </header>
        <div width="50%" className="App-intro">
          Splitter:
          <ul>{listAddrs}</ul>
          <div>numDestinationAddrs is {this.state.numDestinationAddrs}</div>
          {/*<div>destinationAddrs 1 : {this.state.destinationAddrs[0]}</div>*/}
          <form onSubmit={this.handleClick}>
            <input
              type="text"
              value={this.state.newDepositVal}
              onChange={this.depositHandleChange}
            />
            <input type="submit" value="Submit" />
          </form>

        </div>
      </div>
    );
  }
}

export default App;
