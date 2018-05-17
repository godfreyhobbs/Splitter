const Splitter = artifacts.require("./Splitter.sol")

import expectThrow from "zeppelin-solidity/test/helpers/expectThrow"

contract("Splitter", (accounts) => {
  let instance
  beforeEach("deploy a new Splitter contract", async () => {
    instance = await Splitter.new()
  })

  describe("constructor", () => {
    it("should set admin correctly", async () => {
      assert.equal(await instance.owner(), accounts[0])
    })
    it("should initialize users, deposit to zero",
       async () => {
         const instance = await Splitter.new()
         assert.equal(await instance.deposit(), 0)
         assert.equal(await instance.numDestinationAddrs(), 0)
         assert.equal(await instance.QUOTA(), 2)
       })
  })
  describe("fallback functiondeposit", () => {
    it("should fail if numDestinationAddrs is not 2",
       async () => {
         await expectThrow(
            instance.send(web3.toWei(1, "ether"))
         )
         const tx1 = await instance.registerDestinationAddr('Carol', {from: accounts[1]})
         await expectThrow(
            instance.send(web3.toWei(1, "ether"))
         )
         const tx2 = await instance.registerDestinationAddr('Bob', {from: accounts[2]})

         const tx = await instance.send(web3.toWei(1, "ether"))

         assert.equal(tx.logs[0].event, "Deposit")
         assert.equal(tx.logs[0].args.amount, web3.toWei(1, "ether"))
         assert.equal(tx.logs[0].args.deposit, web3.toWei(1, "ether"))
         assert.equal(tx.logs[0].args.from, accounts[0])

       })
    it("should allow increase",

       async () => {
         var tx = await instance.registerDestinationAddr('Carol', {from: accounts[1]})
         tx = await instance.registerDestinationAddr('Bob', {from: accounts[2]})

         tx = await instance.send(web3.toWei(1, "ether"))
         assert.equal(tx.logs[0].event, "Deposit")
         assert.equal(tx.logs[0].args.amount, web3.toWei(1, "ether"))
         assert.equal(tx.logs[0].args.deposit, web3.toWei(1, "ether"))
         assert.equal(tx.logs[0].args.from, accounts[0])

         tx = await instance.send(web3.toWei(1, "ether"))
         assert.equal(tx.logs[0].event, "Deposit")
         assert.equal(tx.logs[0].args.amount, web3.toWei(1, "ether"))
         assert.equal(tx.logs[0].args.deposit, web3.toWei(1, "ether") * 2.0)
         assert.equal(tx.logs[0].args.from, accounts[0])
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
         //
         const storedUser = await instance.destinationAddrs(accounts[1])
         assert.equal(storedUser[0], true)
         assert.equal(storedUser[1], 'Carol')
         assert.equal(storedUser[2], 0)
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
         //
         const storedUser = await instance.destinationAddrs(accounts[1])
         assert.equal(storedUser[0], false)
         assert.equal(storedUser[1], '')
         assert.equal(storedUser[2], 0)
       })
    it("should not allow thrid user register",
       async () => {
         await instance.registerDestinationAddr('Carol', {from: accounts[1]})
         await instance.registerDestinationAddr('Bob', {from: accounts[2]})

         await expectThrow(
            instance.registerDestinationAddr('Sue', {from: accounts[3]})
         )
       })
  })
  describe("withdraw", () => {

    beforeEach("deploy a new Splitter contract", async () => {
      instance = await Splitter.new()
      const tx1 = await instance.registerDestinationAddr('Carol', {from: accounts[1]})
      const tx2 = await instance.registerDestinationAddr('Bob', {from: accounts[2]})

      const tx = await instance.send(web3.toWei(1, "ether"))

      assert.equal(tx.logs[0].event, "Deposit")
      assert.equal(tx.logs[0].args.amount, web3.toWei(1, "ether"))
      assert.equal(tx.logs[0].args.deposit, web3.toWei(1, "ether"))
      assert.equal(tx.logs[0].args.from, accounts[0])
    })

    it("should allow withdrawal",
       async () => {

         const tx = await instance.withdraw(web3.toWei(.5, "ether"), {from: accounts[1]})

         assert.equal(tx.logs[0].event, "Withdrawal")
         assert.equal(tx.logs[0].args.amountWithdrew, web3.toWei(.5, "ether"))
         assert.equal(tx.logs[0].args.fundsWithdrawn, web3.toWei(.5, "ether"))
         assert.equal(tx.logs[0].args.to, accounts[1])

         //
         const storedUser = await instance.destinationAddrs(accounts[1])
         assert.equal(storedUser[0], true)
         assert.equal(storedUser[1], 'Carol')
         assert.equal(storedUser[2], web3.toWei(.5, "ether"))
       })
    it("should allow many withdrawals",
       async () => {
         var tx = await instance.withdraw(web3.toWei(.25, "ether"), {from: accounts[1]})

         assert.equal(tx.logs[0].event, "Withdrawal")
         assert.equal(tx.logs[0].args.amountWithdrew, web3.toWei(.25, "ether"))
         assert.equal(tx.logs[0].args.fundsWithdrawn, web3.toWei(.25, "ether"))
         assert.equal(tx.logs[0].args.to, accounts[1])

         tx = await instance.withdraw(web3.toWei(.25, "ether"), {from: accounts[1]})

         assert.equal(tx.logs[0].event, "Withdrawal")
         assert.equal(tx.logs[0].args.amountWithdrew, web3.toWei(.25, "ether"))
         assert.equal(tx.logs[0].args.fundsWithdrawn, web3.toWei(.5, "ether"))
         assert.equal(tx.logs[0].args.to, accounts[1])
       })
    it("should allow both parties to make withdrawals",
       async () => {
         var tx = await instance.withdraw(web3.toWei(.5, "ether"), {from: accounts[1]})

         assert.equal(tx.logs[0].event, "Withdrawal")
         assert.equal(tx.logs[0].args.amountWithdrew, web3.toWei(.5, "ether"))
         assert.equal(tx.logs[0].args.fundsWithdrawn, web3.toWei(.5, "ether"))
         assert.equal(tx.logs[0].args.to, accounts[1])

         tx = await instance.withdraw(web3.toWei(.5, "ether"), {from: accounts[2]})

         assert.equal(tx.logs[0].event, "Withdrawal")
         assert.equal(tx.logs[0].args.amountWithdrew, web3.toWei(.5, "ether"))
         assert.equal(tx.logs[0].args.fundsWithdrawn, web3.toWei(.5, "ether"))
         assert.equal(tx.logs[0].args.to, accounts[2])
       })

    it("should not allow excessive withdrawal",
       async () => {

         await expectThrow(
            instance.withdraw(web3.toWei(.50, "ether") + 1, {from: accounts[1]})
         )

         var tx = await instance.withdraw(web3.toWei(.5, "ether"), {from: accounts[1]})

         assert.equal(tx.logs[0].event, "Withdrawal")
         assert.equal(tx.logs[0].args.amountWithdrew, web3.toWei(.5, "ether"))
         assert.equal(tx.logs[0].args.fundsWithdrawn, web3.toWei(.5, "ether"))
         assert.equal(tx.logs[0].args.to, accounts[1])

         await expectThrow(
            instance.withdraw(1, {from: accounts[1]})
         )
       })

  })
})
