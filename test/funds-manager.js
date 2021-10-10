const { assertRevert } = require('./helpers/assertRevert')
const {ZERO_ADDRESS} = require("@aragon/contract-helpers-test")
const FundsManager = artifacts.require('MockFundsManager')

contract('FundsManager', ([owner, newOwner, fundsUser, secondFundsUser]) => {

  let fundsManager

  beforeEach(async () => {
    fundsManager = await FundsManager.new()
  })

  describe("Contract tests", () => {

    it('sets correct constructor params', async () => {
      assert.equal(await fundsManager.owner(), owner, "Incorrect owner")
    })

    describe('setOwner()', () => {
      it('sets the owner', async () => {
        await fundsManager.setOwner(newOwner)
        assert.equal(await fundsManager.owner(), newOwner, "Incorrect owner")
      })

      it('reverts when not called by the owner', async () => {
        await assertRevert(fundsManager.setOwner(newOwner, {from: newOwner}), "ERR:NOT_OWNER")
      })
    })

    describe('addFundsUser()', () => {
      it('adds a funds user', async () => {
        await fundsManager.addFundsUser(fundsUser)
        assert.isTrue(await fundsManager.fundsUsers(fundsUser), 'Incorrect funds user state')
      })

      it('reverts when not called by the owner', async () => {
        await assertRevert(fundsManager.addFundsUser(fundsUser, {from: newOwner}), "ERR:NOT_OWNER")
      })
    })

    describe('revokeFundsUser()', () => {
      beforeEach(async () => {
        await fundsManager.addFundsUser(fundsUser)
      })

      it('revokes a funds user', async () => {
        await fundsManager.revokeFundsUser(fundsUser)
        assert.isFalse(await fundsManager.fundsUsers(fundsUser), 'Incorrect funds user state')
      })

      it('reverts when not called by the owner', async () => {
        await assertRevert(fundsManager.revokeFundsUser(fundsUser, {from: newOwner}), "ERR:NOT_OWNER")
      })

      it('reverts when not already a funds user', async () => {
        await assertRevert(fundsManager.revokeFundsUser(secondFundsUser), "ERR:SHOULD_BE_FUNDS_USER")
      })
    })

    describe('onlyFundsUser() modifier', () => {
      it('allows execution from fundsUser', async () => {
        await fundsManager.addFundsUser(fundsUser)

        await fundsManager.transfer(ZERO_ADDRESS, ZERO_ADDRESS, 0, {from: fundsUser})

        assert.equal(await fundsManager.testVar(), 1, "Incorrect testVar value")
      })

      it('allows execution after multiple fundsUsers set', async () => {
        await fundsManager.addFundsUser(fundsUser)
        await fundsManager.addFundsUser(secondFundsUser)

        await fundsManager.transfer(ZERO_ADDRESS, ZERO_ADDRESS, 0, {from: fundsUser})
        await fundsManager.transfer(ZERO_ADDRESS, ZERO_ADDRESS, 0, {from: secondFundsUser})

        assert.equal(await fundsManager.testVar(), 2, "Incorrect testVar value")
      })

      it('reverts execution from non fundsUser', async () => {
        await assertRevert(fundsManager.transfer(ZERO_ADDRESS, ZERO_ADDRESS, 0, {from: owner}), "ERR:NOT_FUNDS_USER")
      })

      it('reverts execution from revoked fundsUser', async () => {
        await fundsManager.addFundsUser(fundsUser)
        await fundsManager.revokeFundsUser(fundsUser)

        await assertRevert(fundsManager.transfer(ZERO_ADDRESS, ZERO_ADDRESS, 0, {from: fundsUser}), "ERR:NOT_FUNDS_USER")
      })
    })
  })
})
