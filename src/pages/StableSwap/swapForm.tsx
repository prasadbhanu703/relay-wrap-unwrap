import { BigNumber, ethers, utils } from 'ethers'
import { ButtonGradient } from '../../components/Button'
import React, { useState, useCallback, useEffect } from 'react'

import styled from 'styled-components'
import { useActiveWeb3React, useEagerConnect } from '../../hooks'

import {
  getBalance,
  stableSwapTransfer,
  InitWeb3,
  returnWrappedLogo,
  returnStableSwapToken,
  getAllowance,
  stableSwapApprove
} from 'state/wrap/hooks'
import ConfirmTransferModal from '../../components/ConfirmTransferModal'
import { useCrosschainState } from '../../state/crosschain/hooks'
import {
  ChainTransferState,
  setCrosschainTransferStatus,
  setCurrentToken,
  setTransferAmount
} from 'state/crosschain/actions'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'

const InputWrap = styled.div`
  display: flex;
  align-items: center;
`

const StyledBalanceMax = styled.button`
  height: 35px;
  position: absolute;
  border: 2px solid #ad00ff;
  background: linear-gradient(90deg, #ad00ff 0%, #7000ff 100%);
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  right: 40px;
  margin-top: 2px;
  color: #fff;
  transition: all 0.2s ease-in-out;
  padding-left: 10px;
  padding-right: 10px;
  :hover {
    opacity: 0.9;
  }
  :focus {
    outline: none;
  }
  align-items: center;
`

const ButtonLayout = styled.div`
  button {
    width: 50%;
    margin: 0 auto;
    margin-top: 1rem;
  }
  .disabled {
    opacity: 0.25;
    pointer-events: none;
  }
`
const WrapWrap = styled.div`
  border-radius: 30px;
  background: rgb(18, 26, 56);
  width: 100%;
  max-width: 585px;
  padding: 2rem;
  position: relative;
  border: 2px solid transparent;
  background-clip: padding-box;
  &::after {
    position: absolute;
    top: -2px;
    bottom: -2px;
    left: -2px;
    right: -2px;
    content: '';
    z-index: -1;
    border-radius: 30px;
    background: linear-gradient(4.66deg, rgba(255, 255, 255, 0.2) 3.92%, rgba(255, 255, 255, 0) 96.38%);
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
            margin-top: 20px
            margin-right: auto;
            margin-left: auto;
        `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
        width: 100%;
        `};
`

const StyledNumericalInput = styled.input`
  box-shadow: 0 0 0 2px #ffffff40;
  position: relative;
  font-weight: 600;
  outline: none;
  border: none;
  min-width: 100px;
  width: 100%;
  height: 60px;
  background: rgba(70, 70, 70, 0.25);
  padding: 0px 15px;
  border-radius: 48px;
  font-size: 24px;
  color: #ffffff;
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-appearance: textfield;
  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
  }
`

const Heading = styled.div`
  display: flex;
  text-align: center;
  font-size: 32px;
  justify-content: space-between;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: 24px;
`};
`

const Description = styled.p`
  text-align: center;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 29px;
  color: #ffffff;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  font-size: 20px;
`};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  font-size: 18px;

`};
`
const BelowForm = styled.div`
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  color: #ffffff;
  padding: 20px;
`
let web3React: any

export const SwapForm = (props: any) => {
  const { typeAction, amount, setAmount } = props
  web3React = useActiveWeb3React()
  InitWeb3()
  const dispatch = useDispatch<AppDispatch>()
  const { account, chainId } = useActiveWeb3React()

  const { crosschainTransferStatus, currentToken } = useCrosschainState()
  // const [relayAmount, setRelayAmount] = useState('')
  // const [nativeAmount, setNativeAmount] = useState('')
  const [confirmTransferModalOpen, setConfirmTransferModalOpen] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [isCrossChain, setIsCrossChain] = useState<boolean>(true)
  const [wrapUnwrap, setWrapUnwrap] = useState(false)
  const [isSuccessAuth, userEthBalance] = useEagerConnect()
  const stableSwapToken = returnStableSwapToken(chainId)
  const [relayBal, setRelayBal] = useState(0)
  const [nativeBal, setNativeBal] = useState(0)
  const [allowance, setAllowance] = useState(0)
  const [isApprove, setIsApprove] = useState(false)
  const [btnDisable, setBtnDisable] = useState(false)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
    setWrapUnwrap(false)
  }, [setModalOpen])

  const getButtonName = () => {
    if (typeAction === 'Relay') {
      return isApprove ? 'Approve' : 'Native'
    } else {
      return isApprove ? 'Approve' : 'Relay'
    }
  }

  const onChangeTransferState = (state: ChainTransferState) => {
    dispatch(
      setCrosschainTransferStatus({
        status: state
      })
    )
  }
  const handleInputAmountChange = useCallback(
    (amount: string) => {
      dispatch(
        setTransferAmount({
          amount: amount
        })
      )
      // if (typeAction === 'Relay') {
      setAmount(amount)
      // setRelayAmount(amount)
      // setNativeAmount(amount)
      // } else {
      //   setNativeAmount(amount)
      // }
    },
    [dispatch]
  )
  const handleSelectToken = () => {
    setModalOpen(true)
    setWrapUnwrap(true)
  }

  const getAllowanceFun = async () => {
    let allowanceAmount: any
    if (typeAction === 'Relay') {
      allowanceAmount = await getAllowance(account, stableSwapToken.relayAddress, stableSwapToken.contract)
    } else {
      allowanceAmount = await getAllowance(account, stableSwapToken.nativeAddress, stableSwapToken.contract)
    }
    setAllowance(allowanceAmount)
  }

  useEffect(() => {
    getAllowanceFun()
  }, [amount, account, typeAction])
  const balanceFun = async () => {
    const relaybal = await getBalance(account, stableSwapToken.relayAddress)
    const nativebal = await getBalance(account, stableSwapToken.nativeAddress)
    setRelayBal(parseInt(relaybal))
    setNativeBal(parseInt(nativebal))
  }

  useEffect(() => {
    // if (typeAction === 'Relay') {
    const inputValue = parseInt(amount) * Math.pow(10, 18)
    setIsApprove(allowance < inputValue)
    // } else {
    //   const inputValue = parseInt(nativeAmount) * Math.pow(10, 18)
    //   setIsApprove(allowance < inputValue)
    // }
  }, [amount, allowance])

  useEffect(() => {
    balanceFun()
  }, [account, stableSwapToken])

  const callHander = () => {
    if (isApprove) {
      if (typeAction === 'Relay') {
        stableSwapApprove(account, stableSwapToken.nativeAddress, stableSwapToken.contract)
      } else {
        stableSwapApprove(account, stableSwapToken.nativeAddress, stableSwapToken.contract)
      }
    } else {
      if (typeAction === 'Relay') {
        stableSwapTransfer(amount, typeAction, stableSwapToken.contract, stableSwapToken.relayAddress)
      } else {
        stableSwapTransfer(amount, typeAction, stableSwapToken.contract, stableSwapToken.nativeAddress)
      }
    }
    setConfirmTransferModalOpen(true)
    getAllowanceFun()
    balanceFun()
  }
  const hideConfirmTransferModal = () => {
    setConfirmTransferModalOpen(false)
    if(isApprove) {
      getAllowanceFun()
    }
  }
  return (
    <>
      <WrapWrap>
        <Heading>
          <Description>{typeAction === 'Relay' ? stableSwapToken.symbol : stableSwapToken.name}</Description>{' '}
        </Heading>
        <>
          {!web3React.account && <p>Please connect to wallet</p>}
          {web3React.account && (
            <>
              <BelowForm style={{ textAlign: 'end' }}>
                {typeAction === 'Relay'
                  ? `${relayBal ? relayBal / Math.pow(10, 18) : '0.00'} ${stableSwapToken.symbol}`
                  : `${nativeBal ? nativeBal / Math.pow(10, 18) : '0.00'} ${stableSwapToken.name}`}
              </BelowForm>
              <InputWrap>
                <StyledNumericalInput
                  placeholder="0.00"
                  autoComplete="off"
                  type="number"
                  name="amount"
                  value={amount}
                  onChange={e => handleInputAmountChange(e.target.value)}
                />

                {/* <StyledBalanceMax style={{ right: '28%' }}>MAX </StyledBalanceMax> */}

                <StyledBalanceMax>
                  {/* <StyledEthereumLogo  size="30px" style={style} /> */}
                  <img
                    src={returnWrappedLogo(chainId)}
                    style={{ verticalAlign: 'middle', height: '20px', width: '25px', paddingRight: '5px' }}
                  />
                  {typeAction === 'Relay' ? stableSwapToken.symbol : stableSwapToken.name}
                </StyledBalanceMax>
              </InputWrap>
              <ButtonLayout>
                <ButtonGradient
                  disabled={
                    typeAction === 'Relay'
                      ? amount > relayBal / Math.pow(10, 18)
                      : amount > nativeBal / Math.pow(10, 18)
                  }
                  onClick={callHander}
                >
                  {getButtonName()}
                </ButtonGradient>
              </ButtonLayout>
            </>
          )}
        </>
      </WrapWrap>
      {/* <WrapTokenModal isOpen={modalOpen} onDismiss={handleDismissSearch} typeAction={typeAction} /> */}
      <ConfirmTransferModal
        isOpen={confirmTransferModalOpen}
        onDismiss={hideConfirmTransferModal}
        changeTransferState={onChangeTransferState}
        tokenTransferState={crosschainTransferStatus}
      />
    </>
  )
}
