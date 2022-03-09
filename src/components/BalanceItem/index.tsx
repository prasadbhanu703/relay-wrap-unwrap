import React from 'react'
import { copyToClipboard, wait } from '../../utils'
import AvaxLogo from '../../assets/images/avax-logo.png'
import MaticLogo from '../../assets/images/matic-logo.png'
import HecoLogo from '../../assets/images/ht.png'
// import BigNumber from 'bignumber.js'
import BinanceLogo from '../../assets/images/binance-logo.png'
// import MoonbaseLogo from '../../assets/images/moonbase-logo.png'
import BubbleBase from '../BubbleBase'
import { ChainId } from '@zeroexchange/sdk'
import CurrencyLogo from '../CurrencyLogo'
import EthereumLogo from '../../assets/images/ethereum-logo.png'
import Icon from '../Icon'

import { returnBalanceNum } from '../../constants'
import styled from 'styled-components'
import { useCurrencyBalance } from '../../state/wallet/hooks'

const BalanceCard = styled.div`
  margin-top: 20px;
  position: relative;
  height: 111.5px;
  width: 100%;
  background: rgba(47, 53, 115, 0.32);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  border-radius: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 34px;
  transition: all 0.2s ease-in-out;
  &.first {
    margin-top: 0px;
  }
  &:hover {
    opacity: .9;
    cursor: pointer;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
  `};
`
const Box = styled.div`
  margin-left: 24px;
`

const CrossChain = styled.div`
  font-weight: 600;
  font-size: 1.5rem;
  span {
    margin-left: 10px;
    color: #929ad6;
    opacity: 0.8;
    font-size: 1rem;
  }
`
const AddressWallet = styled.div`
  font-size: 17px;
  color: #a7b1f4;
  font-weight: bold;
`
const BoxFlex = styled.div`
  display: flex;
  align-items: center;
`
const CopyImage = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  .address {
    margin-right: 6px;
    color: #a7b1f4;
  }
  .copied {
    margin-right: 6px;
    color: #27ae60;
    display: none;
  }
  .icon-regular,
  .icon-green {
    padding-top: 4px;
  }
  .icon-green {
    display: none;
  }
  &:active {
    .address,
    .icon-regular {
      display: none;
    }
    .copied,
    .icon-green {
      display: block;
    }
  }
`

const StyledEthereumLogo = styled.img`
  width: 48px;
  height: 48px;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

export default function BalanceItem({
  account,
  chainId,
  token,
  isNative,
  currentChain,
  userEthBalance,
  isStaked,
  tokenBalances = [],
  selectBalance,
  isLast,
  isFirst,
}: {
  account?: any
  chainId?: any
  token?: any
  isNative?: boolean
  isStaked?: boolean
  currentChain?: any
  userEthBalance?: any
  tokenBalances?: string[]
  selectBalance?: any
  isLast?: boolean;
  isFirst?: boolean;
}) {
  // const weiToEthNum = (balance: any, decimals = 18) => {
  //   const displayBalance = balance.dividedBy(new BigNumber(10).pow(decimals))
  //   return displayBalance.toNumber()
  // }

  const balance = useCurrencyBalance(account ?? undefined, token, chainId)
  const hasABalance = balance && parseFloat(balance.toSignificant(6)) > 0.0000001 ? true : false
  const isContained = tokenBalances.indexOf(token?.address) >= 0 ? true : false

  const returnChainLogo = () => {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.RINKEBY:
      case ChainId.KOVAN:
        return EthereumLogo
      case ChainId.AVALANCHE:
      case ChainId.FUJI:
        return AvaxLogo
      case ChainId.SMART_CHAIN:
      case ChainId.SMART_CHAIN_TEST:
        return BinanceLogo
      case ChainId.MOONBASE_ALPHA:
        return 'Moonbeam Logo'
      case ChainId.MUMBAI:
        return 'Mumbai logo'
      case ChainId.MATIC:
        return MaticLogo
      case ChainId.HECO:
        return HecoLogo  
      default:
        return EthereumLogo
    }
  }

  const onClickCopyClipboard = async (e: any) => {
    e.stopPropagation()
    copyToClipboard(token.address)
    await wait(1)
  }

  return isNative ||
    (!isStaked && !isNative && hasABalance) ||
    (isStaked && ((isContained && !hasABalance) || !isContained)) ? (
    <BalanceCard onClick={selectBalance} className={isLast ? 'last' : isFirst ? 'first' : ''}>
      <BubbleBase />
      <BoxFlex>
        {isNative ? <StyledEthereumLogo src={returnChainLogo()} /> : <CurrencyLogo size="48px" currency={token} />}
        <Box>
          <CrossChain>
            {isNative ? currentChain?.symbol : token?.symbol}
            <span>{isNative ? currentChain?.name : token?.name}</span>
          </CrossChain>
          {isNative ? (
            <AddressWallet>              
              {
              // eslint-disable-next-line
              userEthBalance?.toSignificant(returnBalanceNum(userEthBalance, 4), { groupSeparator: ',' }) || 0
              }
            </AddressWallet>
          ) : (
            <AddressWallet>              
              {
              // eslint-disable-next-line
              hasABalance && balance?.toSignificant(returnBalanceNum(balance, 4), { groupSeparator: ',' }) || 0
              }
            </AddressWallet>
          )}
        </Box>
      </BoxFlex>
      {!isNative && (
        <CopyImage onClick={onClickCopyClipboard}>
          <span className="address">address</span>
          <span className="copied">copied!</span>
          <div className="icon-regular">
            <Icon icon="copyClipboard" />
          </div>
          <div className="icon-green">
            <Icon icon="copyClipboard" color="#27AE60" />
          </div>
        </CopyImage>
      )}
    </BalanceCard>
  ) : (
    <></>
  )
}
