pragma solidity ^0.4.23;

import "node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";

/**
@title Splitter splits deposit between two destination addrs
@author godfreyhobbs

This contact's basic invariant is that a destination addr can never withdraw more than 1/2 of the deposit
Also deposit can only increase.  Deposit can never be reduced

There are 3 people: Alice, Bob and Carol.

TODO website: diplsay the balance of the Splitter contract on the Web page.
TODO website: diplsay the balances of Alice, Bob and Carol on the Web page.
TODO website: Alice can use the Web page to split her ether.

TODO: Alice sends ether to the contract, half of it goes to Bob and the other half to Carol.
TODO: used payable default function

TODO: team up with different people impersonating Alice, Bob and Carol, all cooperating on a test net.
*/


contract Splitter is Ownable {
    using SafeMath for uint;
    // all destination Addresses
    // addresses => User  mapping
    struct User {
        bool exists;
        string name;
        uint256 fundsWithdrawn;
    }

    mapping(address => User) private  destinationAddrs;

    uint public numDestinationAddrs;
    uint public constant QUOTA = 2;
    uint256 public deposit = 0;
    /* Events */
    event RegisterDestinationAddr(address indexed to, string name);
    event Deposit(address indexed _fromAddress, uint256 amount, uint256 deposit);
    event Withdrawal(address indexed _toAddress, uint256 amountWithdrew, uint256 fundsWithdrawn);

    /* Constructor */
    constructor() public { deposit = 0;}

    /* Fallback function */
    function ()
     public
     payable
    {
        require(QUOTA == numDestinationAddrs);
        deposit += msg.value;

        emit Deposit(msg.sender, msg.value, deposit);
    }

    /* Public functions */

    /**
     @notice add named destination address
     @param _name the name of the destination address
     @return success Boolean
     */
    function registerDestinationAddr(string _name)
     public
     returns (bool)
     {
        // name cannot be zero
        require(QUOTA > numDestinationAddrs);
        // sol string compare hack
        // consider using stringUtils
        require(keccak256(_name) != keccak256(""));
        require(!destinationAddrs[msg.sender].exists);
        //Allow update without error
        destinationAddrs[msg.sender] = User({
            exists: true,
            name: _name,
            fundsWithdrawn: 0
            });
        // name cannot be zero once mapped
        // sol string compare hack
        // consider using stringUtils
        require(destinationAddrs[msg.sender].exists);


        numDestinationAddrs++;
        emit RegisterDestinationAddr(msg.sender, _name);
        return true;
    }

  /**
    @notice         Allows withdraw of their share of the deposit
    @param _amount   Withdraw from unclaimed share of the deposit
    @return success Boolean
    */
    function withdraw(uint256 _amount)
        //!onlyOwner
        public
        returns (bool)
     {
        require(destinationAddrs[msg.sender].exists);
        // invariant is that a destination addr can never withdraw more than 1/2 of the deposit
        require(destinationAddrs[msg.sender].fundsWithdrawn + _amount <= (deposit/QUOTA));
        destinationAddrs[msg.sender].fundsWithdrawn += _amount;
        msg.sender.transfer(_amount);
        emit Withdrawal(msg.sender, _amount, destinationAddrs[msg.sender].fundsWithdrawn);
        return true;
    }
}