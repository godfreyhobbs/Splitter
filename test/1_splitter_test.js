const Splitter = artifacts.require("./Splitter.sol")

import expectThrow from "zeppelin-solidity/test/helpers/expectThrow"

contract("Splitter", (accounts) => {
  let instance
  beforeEach("deploy a new Splitter contract", async () => {
    instance = await Splitter.new()
  })

  describe("constructor", () => {
    it("should set admin correctly", async () => {
      const instance = await Splitter.new()
      assert.equal(await instance.owner(), accounts[0])
    })
    it("should initialize users, deposit to zero",
       async () => {
         assert.equal(await instance.deposit(), 0)
         assert.equal(await instance.numDestinationAddrs(), 0)
         assert.equal(await instance.QUOTA(), 2)
       })
  })
  describe("register", () => {
    it("should allow user to self register",
       async () => {
         const tx = await instance.registerDestinationAddr('Carol', {from: accounts[1]})
         assert.equal(tx.logs[0].event, "RegisterDestinationAddr")
         assert.equal(tx.logs[0].args.name, 'Carol')
         assert.equal(tx.logs[0].args.to, accounts[1])
         assert.equal(await instance.numDestinationAddrs(), 1)
         // //
         // const storedUser = await instance.users(accounts[1])
         // assert.equal(storedUser[0], true)
         // assert.equal(storedUser[1], tx.receipt.blockNumber)
         // assert.equal(storedUser[2], 0)
       })
    it("should not allow a user to self register as twice",
       async () => {
         const tx = await instance.registerDestinationAddr('Carol', {from: accounts[1]})
         assert.equal(tx.logs[0].args.to, accounts[1])
         await expectThrow(
           instance.registerDestinationAddr('Carol', {from: accounts[1]})
         )
         assert.equal(await instance.numDestinationAddrs(), 1)
       })
    it("should not allow a user with no name",
       async () => {

         await expectThrow(
            instance.registerDestinationAddr('', {from: accounts[1]})
         )
         assert.equal(await instance.numDestinationAddrs(), 0)
         await expectThrow(
            instance.registerDestinationAddr(0, {from: accounts[1]})
         )
         assert.equal(await instance.numDestinationAddrs(), 0)
       })

  })
})
