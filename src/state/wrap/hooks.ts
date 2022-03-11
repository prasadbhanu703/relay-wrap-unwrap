import { BigNumber, ethers, utils } from 'ethers'
import { useActiveWeb3React, useEagerConnect } from '../../hooks'
import { ChainId } from '@zeroexchange/sdk'
import Web3 from 'web3'
import getGasPrice from 'hooks/getGasPrice'
import { getCrosschainState, WithDecimals, WithDecimalsHexString } from 'state/crosschain/hooks'
import { ChainTransferState, setCrosschainTransferStatus } from 'state/crosschain/actions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
const WrapABI = require('../../constants/abis/wrapToken.json').abi

let web3React: any
let dispatch: AppDispatch

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
    console.log(wrapValue)

    const signer = web3React.library.getSigner()
    const wrapContract = new ethers.Contract('0x517B4A3dE5f6E2c242660e2211288537d9B79B6d', WrapABI, signer)

    let resultDepositTx: any

    if(typeAction == 'wrap'){
      resultDepositTx = await wrapContract.deposit({ value: wrapValue })
    } else{
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
