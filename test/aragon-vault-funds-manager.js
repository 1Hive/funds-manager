const { assertRevert } = require('./helpers/assertRevert')
const {ZERO_ADDRESS} = require("@aragon/contract-helpers-test");
const AragonVaultFundsManager = artifacts.require('AragonVaultFundsManager')
const Vault = artifacts.require('VaultMock')
const MiniMeToken = artifacts.require('MiniMeToken')

contract('AragonVaultFundsManager', ([owner, tokenReceiver]) => {

  let token, vault, aragonVaultFundsManager

  const VAULT_FUNDS = 1000

  beforeEach(async () => {
    vault = await Vault.new()
    aragonVaultFundsManager = await AragonVaultFundsManager.new(vault.address)

    token = await MiniMeToken.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'token', 18, 'TKN', true)
    await token.generateTokens(vault.address, VAULT_FUNDS)
  })

  describe("Contract tests", () => {

    it('sets correct constructor params', async () => {
      assert.equal(await aragonVaultFundsManager.aragonVault(), vault.address, "Incorrect owner")
    })

    describe('fundsOwner()', () => {
      it('returns the funds owner', async () => {
        assert.equal(await aragonVaultFundsManager.fundsOwner(), vault.address, "Incorrect funds owner")
      })
    })

    describe('balance()', () => {
      it('returns the correct balance', async () => {
        assert.equal(await aragonVaultFundsManager.balance(token.address), VAULT_FUNDS, "Incorrect balance")
      })
    })

    describe('transfer()', () => {
      it('transfers the funds', async () => {
        const transferAmount = 250
        await aragonVaultFundsManager.addFundsUser(owner)

        await aragonVaultFundsManager.transfer(token.address, tokenReceiver, transferAmount)

        assert.equal(await token.balanceOf(tokenReceiver), transferAmount, "Incorrect token receiver balance")
        assert.equal(await token.balanceOf(vault.address), VAULT_FUNDS - transferAmount, "Incorrect vault balance")
      })

      it('reverts when not called by the fundsUser', async () => {
        await assertRevert(aragonVaultFundsManager.transfer(token.address, tokenReceiver, 250, {from: tokenReceiver}), "ERR:NOT_FUNDS_USER")
      })
    })
  })
})
