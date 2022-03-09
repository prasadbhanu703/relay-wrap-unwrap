import { CloseIcon, TYPE } from '../../theme'
import { LoadingView, SubmittedView } from '../ModalViews'
import React, { useState } from 'react'

import { AutoColumn } from '../Column'
import { ButtonError } from '../Button'
import Modal from '../Modal'
import { RowBetween } from '../Row'
import { StakingInfo } from '../../state/stake/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import styled from 'styled-components'
import toEllipsis from './../../utils/toEllipsis'
import { useActiveWeb3React } from '../../hooks'
import { useStakingContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`
const MAX_SHOW_WIDTH = 16

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
}

export default function ClaimRewardModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account } = useActiveWeb3React()

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)

  async function onClaimReward() {
    if (stakingContract && stakingInfo?.stakedAmount) {
      setAttempting(true)
      await stakingContract
        .getReward({ gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Claim accumulated ${stakingInfo?.rewardsTokenSymbol || ''} rewards`
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? 'Enter amount'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Claim</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {stakingInfo?.earnedAmount && (
            <AutoColumn justify="center" gap="md">
              <TYPE.body fontWeight={600} fontSize={36}>
                {toEllipsis(
                  stakingInfo?.earnedAmount
                  ?.divide(stakingInfo?.rewardInfo?.rewardsMultiplier ? stakingInfo?.rewardInfo?.rewardsMultiplier : 1)
                  ?.toSignificant(6, { groupSeparator: ',' }),
                  stakingInfo?.earnedAmount
                  ?.divide(stakingInfo?.rewardInfo?.rewardsMultiplier ? stakingInfo?.rewardInfo?.rewardsMultiplier : 1)
                  ?.toSignificant(6, { groupSeparator: ',' }).length > MAX_SHOW_WIDTH
                    ? stakingInfo?.earnedAmount
                    .divide(stakingInfo?.rewardInfo?.rewardsMultiplier ? stakingInfo?.rewardInfo?.rewardsMultiplier : 1)
                    ?.toSignificant(6, { groupSeparator: ',' }).length - MAX_SHOW_WIDTH
                    : 0
                )}
              </TYPE.body>
              <TYPE.body>Unclaimed {stakingInfo?.rewardsTokenSymbol || 'ZERO'}</TYPE.body>
            </AutoColumn>
          )}
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            When you claim without withdrawing your liquidity remains in the mining pool.
          </TYPE.subHeader>
          <ButtonError disabled={!!error} error={!!error && !!stakingInfo?.stakedAmount} onClick={onClaimReward}>
            {error ?? 'Claim'}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Claiming {
            stakingInfo?.earnedAmount
            ?.divide(stakingInfo?.rewardInfo?.rewardsMultiplier ? stakingInfo?.rewardInfo?.rewardsMultiplier : 1)
            ?.toSignificant(6)} {stakingInfo?.rewardsTokenSymbol || 'ZERO'}</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed {stakingInfo?.rewardsTokenSymbol || 'ZERO'}!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
