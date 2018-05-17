const Splitter = artifacts.require("./Splitter.sol")

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
})
