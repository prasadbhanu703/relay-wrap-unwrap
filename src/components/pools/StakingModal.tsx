import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { ButtonConfirmed, ButtonError } from '../Button'
import { ChainId, Pair, TokenAmount } from '@zeroexchange/sdk'
import { CloseIcon, TYPE } from '../../theme'
import { LoadingView, SubmittedView } from '../ModalViews'
import React, { useCallback, useState } from 'react'
import { RowBetween, RowCenter } from '../Row'
import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { usePairContract, useStakingContract } from '../../hooks/useContract'

import { AutoColumn } from '../Column'
import CurrencyInputPanel from '../CurrencyInputPanel'
import DoubleCurrencyLogo from '../DoubleLogo'
import Modal from '../Modal'
import ProgressCircles from '../ProgressSteps'
import { TransactionResponse } from '@ethersproject/providers'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { splitSignature } from 'ethers/lib/utils'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import { useTransactionAdder } from '../../state/transactions/hooks'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { wrappedCurrencyAmount } from '../../utils/wrappedCurrency'

const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;
  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
  userLiquidityUnstaked: TokenAmount | undefined
}

export default function StakingModal({ isOpen, onDismiss, stakingInfo, userLiquidityUnstaked }: StakingModalProps) {
  const { account, chainId, library } = useActiveWeb3React()

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, stakingInfo.stakedAmount.token, userLiquidityUnstaked)
  const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId)

  let hypotheticalRewardRate: TokenAmount = new TokenAmount(stakingInfo.rewardRate.token, '0')
  if (parsedAmountWrapped?.greaterThan('0')) {
    hypotheticalRewardRate = stakingInfo.getHypotheticalRewardRate(
      stakingInfo.stakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalStakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalRewardRate,
      60 * 60 * 24 * 7,
      1
    )
  }

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])


  let dummyPair = null;
  let pairAddress = null;
  // pair contract for this token to be staked
  const isSingleSided = stakingInfo.tokens[0] === stakingInfo.tokens[1];
  if (!isSingleSided) {
    dummyPair = new Pair(new TokenAmount(stakingInfo.tokens[0], '0'), new TokenAmount(stakingInfo.tokens[1], '0'));
    pairAddress = dummyPair.liquidityToken.address;
  } else {
    pairAddress = stakingInfo?.stakedAmount?.token.address;
  }

  const pairContract = usePairContract(pairAddress);

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, stakingInfo.stakingRewardAddress)

  const isArgentWallet = useIsArgentWallet()
  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)
  async function onStake() {
    setAttempting(true)
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        const response: TransactionResponse = await stakingContract.stake(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 })
        if (response.hash) {
          addTransaction(response, {
            summary: `Deposit liquidity`
          })
          setHash(response.hash)
        }
      } else if (signatureData) {
        stakingContract
          .stakeWithPermit(
            `0x${parsedAmount.raw.toString(16)}`,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
            { gasLimit: 350000 }
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Deposit liquidity`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setSignatureData(null)
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(
      maxAmountInput
        ?.toSignificant(Math.min(4, stakingInfo?.earnedAmount?.currency.decimals))
    )
  }, [maxAmountInput, onUserInput, stakingInfo])

  async function onAttemptToApprove() {
    if (!pairContract || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmount
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    if (isArgentWallet) {
      return approveCallback()
    }

    const otherExchagesPairs = [
      '0xE9a889E6963f122a98f8083d951c71329c726c0A',
      '0x1dE027DED494175C229c016A9697F85794006a59',
      '0x3AEd5B9062A222721051759568CcD68d09f3d927', // uniswap
      '0x41f3092d6Dd8dB25ec0f7395F56CAc107EcB7A12',
    ];
    // if it's sushi pair, just use the usual approve
    if (otherExchagesPairs.includes(pairContract.address)) return approveCallback();

    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account).catch((e: any) => null);

    if (nonce == null) return approveCallback();

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
    const domain = {
      name: `${chainId && (chainId === ChainId.MAINNET || chainId === ChainId.RINKEBY) ? 'Uniswap V2' : 'ZERO-LP-Token'
        }`,
      version: '1',
      chainId: chainId,
      verifyingContract: pairContract.address
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
    const message = {
      owner: account,
      spender: stakingInfo.stakingRewardAddress,
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber()
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then(signature => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadline.toNumber()
        })
      })
      .catch(error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          approveCallback()
        }
      })
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <DoubleCurrencyLogo currency0={dummyPair?.token0} currency1={dummyPair?.token1} size={32} />
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <RowCenter>
            <TYPE.mediumHeader>Deposit {dummyPair?.token0.symbol} - {dummyPair?.token1.symbol}</TYPE.mediumHeader>
          </RowCenter>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={stakingInfo.stakedAmount.token}
            pair={dummyPair}
            label={''}
            disableCurrencySelect={true}
            hideCurrencySelect={true}
            customBalanceText={isSingleSided ? 'Available tokens: ' : 'Available LP: '}
            id="stake-liquidity-token"
            stakingInfo={stakingInfo}
          />

          <HypotheticalRewardRate dim={!hypotheticalRewardRate.greaterThan('0')}>
            <div>
              <TYPE.black fontWeight={600}>Weekly Rewards</TYPE.black>
            </div>

            <TYPE.black>
              {hypotheticalRewardRate
                .divide(stakingInfo?.rewardInfo?.rewardsMultiplier ? stakingInfo?.rewardInfo?.rewardsMultiplier : 1)
                .toSignificant(4, { groupSeparator: ',' })}{' '}
              {stakingInfo?.rewardsTokenSymbol ?? 'ZERO'} / week
            </TYPE.black>
          </HypotheticalRewardRate>

          <RowBetween>
            <ButtonConfirmed
              mr="0.5rem"
              onClick={onAttemptToApprove}
              confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
              disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
            >
              Approve
            </ButtonConfirmed>
            <ButtonError
              disabled={!!error || (signatureData === null && approval !== ApprovalState.APPROVED)}
              error={!!error && !!parsedAmount}
              onClick={onStake}
            >
              {error ?? 'Deposit'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED || signatureData !== null]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>{isSingleSided ? `Depositing tokens` : `Depositing Liquidity`}</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} {isSingleSided ? `Tokens` : `LP`}</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Deposited {parsedAmount?.toSignificant(4)} {isSingleSided ? `Tokens` : `LP`}</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
