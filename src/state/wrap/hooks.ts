import { BigNumber, ethers, utils } from 'ethers'
import { useActiveWeb3React, useEagerConnect } from '../../hooks'
import Web3 from 'web3'
import getGasPrice from 'hooks/getGasPrice'
import { getCrosschainState, WithDecimals, WithDecimalsHexString } from 'state/crosschain/hooks'
import {
  ChainTransferState,
  setAvailableTokens,
  setCrosschainTransferStatus,
  setCurrentChain,
  setCurrentToken,
  setTargetTokens
} from 'state/crosschain/actions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { ETHER_CURRENCIES, ChainId, Currency, CurrencyAmount, JSBI, Token, TokenAmount, Trade } from '@zeroexchange/sdk'
import { Field } from 'state/swap/actions'
// import BNBIcon from '../../assets/svg/bnb.svg'
// import {  } from 'constants/abis/erc20'
import BinanceLogo from '../../assets/images/binance-logo.png'
import EthereumLogo from '../../assets/images/ethereum-logo.png'

const WrapABI = require('../../constants/abis/wrapToken.json').abi
const WBNB_ABI = require('../../constants/abis/wbnb.json').abi

let web3React: any
let dispatch: AppDispatch

export const returnWrappedLogo = (chainId: any) => {
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.RINKEBY:
    case ChainId.KOVAN:
      return EthereumLogo
    case ChainId.AVALANCHE:
    case ChainId.SMART_CHAIN:
      return BinanceLogo
    case ChainId.SMART_CHAIN_TEST:
      return BinanceLogo
    case ChainId.MOONBASE_ALPHA:
      return 'Moonbeam Logo'
    case ChainId.MUMBAI:
      return 'Mumbai logo'
    default:
      return EthereumLogo
  }
}
export const returnWrappedToken = (chainId: any) => {
  switch (chainId) {
    case ChainId.SMART_CHAIN_TEST:
      return {
        name: 'BNB',
        address: '0x517B4A3dE5f6E2c242660e2211288537d9B79B6d',
        icon: BinanceLogo,
        assetBase: '',
        symbol: 'WBNB',
        decimals: 18,
        resourceId: '',
        allowedChainsToTransfer: []
      }

    default:
      return {
        name: 'BNB',
        address: '0x517B4A3dE5f6E2c242660e2211288537d9B79B6d',
        icon: BinanceLogo,
        assetBase: '',
        symbol: 'WBNB',
        decimals: 18,
        resourceId: '',
        allowedChainsToTransfer: []
      }
  }
}

export const getBalance = async (account: any, address: string) => {
  try {
    const signer = web3React.library.getSigner()

    const tokenContract = new ethers.Contract(address, WBNB_ABI, signer)
    const balance = await tokenContract.balanceOf(account)
    return balance
  } catch (e) {
    console.log('err', e)
  }
}

export const tokenList = [
  {
    name: 'BNB',
    address: '0x517B4A3dE5f6E2c242660e2211288537d9B79B6d',
    icon: BinanceLogo,
    assetBase: '',
    symbol: 'WBNB',
    decimals: 18,
    resourceId: '',
    allowedChainsToTransfer: []
  }
]

export const InitWeb3 = () => {
  web3React = useActiveWeb3React()
  dispatch = useDispatch()
}
export const wrapUnWrap = async (typeAction: string) => {
  try {
    dispatch(
      setCrosschainTransferStatus({
        status: ChainTransferState.TransferPending
      })
    )
    const crosschainState = getCrosschainState()

    const currentGasPrice = await getGasPrice(+crosschainState.currentChain.chainID)
    //   const gasPriceDecimal = WithDecimals(currentGasPrice)
    const wrapValue = WithDecimalsHexString(crosschainState.transferAmount, 18)

    const signer = web3React.library.getSigner()
    const wrapContract = new ethers.Contract('0x517B4A3dE5f6E2c242660e2211288537d9B79B6d', WrapABI, signer)

    let resultDepositTx: any

    if (typeAction !== 'Wrap') {
      resultDepositTx = await wrapContract.deposit({ value: wrapValue })
    } else {
      resultDepositTx = await wrapContract.withdraw(wrapValue)
    }
    if (!resultDepositTx) {
      return
    }

    await resultDepositTx.wait()

    dispatch(
      setCrosschainTransferStatus({
        status: ChainTransferState.TransferComplete
      })
    )
  } catch (err) {
    console.log(err)
    dispatch(
      setCrosschainTransferStatus({
        status: ChainTransferState.TransferFailed
      })
    )
  }
}
