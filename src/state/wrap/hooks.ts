import { BigNumber, ethers, utils } from 'ethers'
import { useActiveWeb3React, useEagerConnect } from '../../hooks'
import Web3 from 'web3'
import getGasPrice from 'hooks/getGasPrice'
import { getCrosschainState, WithDecimals, WithDecimalsHexString } from 'state/crosschain/hooks'
import { ChainTransferState, setCrosschainTransferStatus } from 'state/crosschain/actions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { ETHER_CURRENCIES, ChainId, Currency, CurrencyAmount, JSBI, Token, TokenAmount, Trade } from '@zeroexchange/sdk'
import { Field } from 'state/swap/actions'
// import BNBIcon from '../../assets/svg/bnb.svg'
// import {  } from 'constants/abis/erc20'
import BinanceLogo from '../../assets/images/binance-logo.png'
import AvaxLogo from '../../assets/images/avax-logo.png'
import EthereumLogo from '../../assets/images/ethereum-logo.png'
import { AVAX_ROUTER_ADDRESS } from '../../constants'
import ERC20_ABI from '../../constants/abis/erc20'
import AVAX_ERC20 from '../../constants/abis/avax-erc20.json'
// eslint-disable-next-line @typescript-eslint/camelcase
import Avax_testnet_abi from '../../constants/abis/avax-testnet-abi.json'

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

export const returnStableSwapToken = (chainId: any) => {
  switch (chainId) {
    case ChainId.FUJI: //avalanche-testnet
      return {
        name: 'miMatic',
        relayAddress: '0x2FC235b248F3f0D17B3b130551D574A9359b2fB0',
        nativeAddress: '0xba8e1F9962aF2BBB5541B0DAB7B80e1C99F9463a',
        contract: '0x2FC235b248F3f0D17B3b130551D574A9359b2fB0',
        icon: AvaxLogo,
        assetBase: '',
        symbol: 'MAI',
        decimals: 18,
        resourceId: '',
        allowedChainsToTransfer: []
      }

    case ChainId.AVALANCHE: //avalanche-mainnet
      return {
        name: 'miMatic',
        relayAddress: '0x5c49b268c9841AFF1Cc3B0a418ff5c3442eE3F3b',
        nativeAddress: '0x3B55E45fD6bd7d4724F5c47E0d1bCaEdd059263e',
        contract: '0xbE56bFF41AD57971DEDfBa69f88b1d085E349d47',
        icon: AvaxLogo,
        assetBase: '',
        symbol: 'MAI',
        decimals: 18,
        resourceId: '',
        allowedChainsToTransfer: []
      }

    case ChainId.MOONRIVER:
      return {
        name: 'miMatic',
        relayAddress: '0xFb2019DfD635a03cfFF624D210AEe6AF2B00fC2C',
        nativeAddress: '0x7f5a79576620C046a293F54FFCdbd8f2468174F1',
        contract: '0xcA8a932e5aA63961D975aFA005d34Ef73C59bb45',
        icon: BinanceLogo,
        assetBase: '',
        symbol: 'MAI',
        decimals: 18,
        resourceId: '',
        allowedChainsToTransfer: []
      }
    case ChainId.HARMONY:
      return {
        name: 'miMatic',
        relayAddress: '0xB9C8F0d3254007eE4b98970b94544e473Cd610EC',
        nativeAddress: '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
        contract: '0xC85C1ce70C4Bf751a73793D735e9D0209152F13d',
        icon: BinanceLogo,
        assetBase: '',
        symbol: 'MAI',
        decimals: 18,
        resourceId: '',
        allowedChainsToTransfer: []
      }
    case ChainId.CRONOS:
      return {
        name: 'miMatic',
        relayAddress: '0x2Ae35c8E3D4bD57e8898FF7cd2bBff87166EF8cb',
        nativeAddress: '0x1c965D8E53fb1a448789e2B0FA5abc3EB2c36993',
        contract: '0xF5c2B1b92456FE1B1208C63D8eA040D464f74a72',
        icon: BinanceLogo,
        assetBase: '',
        symbol: 'MAI',
        decimals: 18,
        resourceId: '',
        allowedChainsToTransfer: []
      }

    default:
      return {
        name: 'miMatic',
        relayAddress: '0xbE56bFF41AD57971DEDfBa69f88b1d085E349d47',
        nativeAddress: '0x5c49b268c9841AFF1Cc3B0a418ff5c3442eE3F3b',
        icon: AvaxLogo,
        assetBase: '',
        symbol: 'MAI',
        decimals: 18,
        resourceId: '',
        allowedChainsToTransfer: []
      }
  }
}

export const getBalance = async (account: any, address: any, typeAction?: any) => {
  try {
    const signer = web3React.library.getSigner()

    let tokenContract: any
    if (typeAction) {
      tokenContract = new ethers.Contract(address, ERC20_ABI, signer)
    } else {
      tokenContract = new ethers.Contract(address, WBNB_ABI, signer)
    }
    const balance = await tokenContract.balanceOf(account)
    return balance
  } catch (e) {
    console.log('err', e)
  }
}
export const getAllowance = async (account: any, address: any, contract: any) => {
  try {
    const signer = web3React.library.getSigner()

    const tokenContract = new ethers.Contract(address, ERC20_ABI, signer)

    const allowance = await tokenContract.allowance(account, contract)
    return allowance
  } catch (e) {
    console.log('err allowance', e)
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

export const stableSwapApprove = async (account: any, address: any, contract: any) => {
  try {
    dispatch(
      setCrosschainTransferStatus({
        status: ChainTransferState.TransferPending
      })
    )
    const crosschainState = getCrosschainState()

    const currentGasPrice = await getGasPrice(+crosschainState.currentChain.chainID)
    //   const gasPriceDecimal = WithDecimals(currentGasPrice)
    const signer = web3React.library.getSigner()

    const tokenContract = new ethers.Contract(address, AVAX_ERC20, signer)
    const approvalAmount = '100000000000000000000000000000000000000000000000000'
    // const gasLimit = await tokenContract.approve(AVAX_ROUTER_ADDRESS, approvalAmount + 10).estimateGas({
    //   from: account
    // })
    const result = await tokenContract.approve(contract, approvalAmount + 10)
    // .send({
    //   from: account
    //   // gas: gasLimit + 1000
    // })

    if (!result) {
      return
    }

    await result.wait()

    dispatch(
      setCrosschainTransferStatus({
        status: ChainTransferState.TransferComplete
      })
    )
  } catch (err) {
    console.log("err transfer",err)
    dispatch(
      setCrosschainTransferStatus({
        status: ChainTransferState.TransferFailed
      })
    )
  }
}
export const stableSwapTransfer = async (value: string, typeAction: string, contract: any, address: any) => {
  try {
    dispatch(
      setCrosschainTransferStatus({
        status: ChainTransferState.TransferPending
      })
    )
    const crosschainState = getCrosschainState()

    const currentGasPrice = await getGasPrice(+crosschainState.currentChain.chainID)
    //   const gasPriceDecimal = WithDecimals(currentGasPrice)
    // const wrapValue = WithDecimalsHexString(value, 18)
    // console.log("wrap", wrapValue)
    const valueInWei = Number(value) * Math.pow(10, 18)

    const signer = web3React.library.getSigner()

    const tokenContract = new ethers.Contract(contract, AVAX_ERC20, signer)
    let result: any

    if (typeAction === 'Relay') {
      result = await tokenContract.swapOut(address, valueInWei.toString())
    } else {
      result = await tokenContract.swapIn(address, valueInWei.toString())
    }
    if (!result) {
      return
    }

    await result.wait()

    dispatch(
      setCrosschainTransferStatus({
        status: ChainTransferState.TransferComplete
      })
    )
  } catch (err) {
    console.log('err transfer', err)
    dispatch(
      setCrosschainTransferStatus({
        status: ChainTransferState.TransferFailed
      })
    )
  }
}
