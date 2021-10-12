const { assertRevert } = require('./helpers/assertRevert')
const {ZERO_ADDRESS, bn} = require("@aragon/contract-helpers-test");
const { web3 } = require("hardhat");
const GnosisSafeFundsManager = artifacts.require('GnosisSafeFundsManager')
const GnosisSafe = artifacts.require('GnosisSafeMock')
const MiniMeToken = artifacts.require('MiniMeToken')

contract('GnosisSafeFundsManager', ([owner, tokenReceiver]) => {

  let token, gnosisSafe, gnosisSafeFundsManager
  const ETH_ADDRESS = ZERO_ADDRESS;

  const GNOSIS_SAFE_ETH_FUNDS = 800
  const GNOSIS_SAFE_TOKEN_FUNDS = 1000

  beforeEach(async () => {
    gnosisSafe = await GnosisSafe.new()
    gnosisSafeFundsManager = await GnosisSafeFundsManager.new(gnosisSafe.address)

    await gnosisSafe.send(GNOSIS_SAFE_ETH_FUNDS, { from:owner })
    token = await MiniMeToken.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'token', 18, 'TKN', true)
    await token.generateTokens(gnosisSafe.address, GNOSIS_SAFE_TOKEN_FUNDS)
  })

  describe("Contract tests", () => {

    it('sets correct constructor params', async () => {
      assert.equal(await gnosisSafeFundsManager.gnosisSafe(), gnosisSafe.address, "Incorrect owner")
    })

    describe('fundsOwner()', () => {
      it('returns the funds owner', async () => {
        assert.equal(await gnosisSafeFundsManager.fundsOwner(), gnosisSafe.address, "Incorrect funds owner")
      })
    })

    describe('balance()', () => {
      it('returns the correct balance for token', async () => {
        assert.equal(await gnosisSafeFundsManager.balance(token.address), GNOSIS_SAFE_TOKEN_FUNDS, "Incorrect balance")
      })

      it('returns the correct balance for eth', async () => {
        assert.equal(await gnosisSafeFundsManager.balance(ETH_ADDRESS), GNOSIS_SAFE_ETH_FUNDS, "Incorrect balance")
      })
    })

    describe('transfer()', () => {
      it('transfers ERC20 token funds', async () => {
        const transferAmount = 250
        await gnosisSafeFundsManager.addFundsUser(owner)

        await gnosisSafeFundsManager.transfer(token.address, tokenReceiver, transferAmount)

        assert.equal(await token.balanceOf(tokenReceiver), transferAmount, "Incorrect token receiver balance")
        assert.equal(await token.balanceOf(gnosisSafe.address), GNOSIS_SAFE_TOKEN_FUNDS - transferAmount, "Incorrect gnosisSafe balance")
        assert.equal(await gnosisSafe.operationPassed(), 0, "Incorrect operation")
      })

      it('transfers ETH funds', async () => {
        const transferAmount = bn(250)
        const tokenReceiverBalanceBefore = bn(await web3.eth.getBalance(tokenReceiver))
        await gnosisSafeFundsManager.addFundsUser(owner)

        await gnosisSafeFundsManager.transfer(ETH_ADDRESS, tokenReceiver, transferAmount)

        assert.equal(await web3.eth.getBalance(tokenReceiver), tokenReceiverBalanceBefore.add(transferAmount), "Incorrect token receiver balance")
        assert.equal(await web3.eth.getBalance(gnosisSafe.address), GNOSIS_SAFE_ETH_FUNDS - transferAmount, "Incorrect gnosisSafe balance")
        assert.equal(await gnosisSafe.operationPassed(), 0, "Incorrect operation")
      })

      it('reverts when token transfer returns false', async () => {
        await gnosisSafeFundsManager.addFundsUser(owner)
        await assertRevert(gnosisSafeFundsManager.transfer(token.address, tokenReceiver, GNOSIS_SAFE_TOKEN_FUNDS + 1), "ERR:TRANSFER_NOT_RETURN_TRUE")
      })

      it('reverts when token transfer reverts', async () => {
        await gnosisSafeFundsManager.addFundsUser(owner)
        // Note that the MiniMeToken requires that, and therefore reverts when, the receiving address isn't the zero address
        await assertRevert(gnosisSafeFundsManager.transfer(token.address, ZERO_ADDRESS, GNOSIS_SAFE_TOKEN_FUNDS), "ERR:TRANSFER_REVERTED")
      })

      it('reverts when eth transfer reverts', async () => {
        await gnosisSafeFundsManager.addFundsUser(owner)
        await assertRevert(gnosisSafeFundsManager.transfer(ETH_ADDRESS, tokenReceiver, GNOSIS_SAFE_ETH_FUNDS + 1), "ERR:TRANSFER_REVERTED")
      })

      it('reverts when not called by the owner', async () => {
        await assertRevert(gnosisSafeFundsManager.transfer(token.address, tokenReceiver, 250, {from: tokenReceiver}), "ERR:NOT_FUNDS_USER")
      })
    })
  })
})
