import Column from 'components/Column'
import CurrencyLogo, { getLogoByName } from 'components/CurrencyLogo'
import Modal from 'components/Modal'
import { RowBetween, RowFixed } from 'components/Row'
import {
//   ArrowLeft,
//   StyledCloseIcon,
//   StyledInput,
//   TitleFrom,
//   TitleSearchWindow
} from 'components/SearchModal/CurrencySearch'
import { MenuItem, PaddedColumn } from 'components/SearchModal/styleds'
import useLast from 'hooks/useLast'
import React, { useEffect, useState } from 'react'
import { useCrosschainState } from 'state/crosschain/hooks'
import { getBalance, returnWrappedToken, tokenList } from 'state/wrap/hooks'
import { Text } from 'rebass'
import { useTokenBalances } from 'state/user/hooks'
// import { Balance } from 'components/SearchModal/CurrencyList'
import Loader from 'components/Loader'
import { useActiveWeb3React } from 'hooks'

const WrapTokenModal = (props: any) => {
  const { isOpen, onDismiss, typeAction, style } = props
  const [listView, setListView] = useState<boolean>(false)
  const lastOpen = useLast(isOpen)
  const [balance, setBalance] = useState(0)
  const tokenBalances = useTokenBalances()
  const { account, chainId } = useActiveWeb3React()

    // useEffect(() => {
    //   const findBalance = tokenBalances?.find((x: any) => x.address.toLowerCase() === tokenList[0].address.toLowerCase())
    //   if (findBalance) {
    //     setBalance(findBalance.balance)
    //   }
    //   // eslint-disable-next-line
    // }, [tokenBalances, account]);

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setListView(false)
    }
  }, [isOpen, lastOpen])
  const { currentChain } = useCrosschainState()

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={84} minHeight={listView ? 40 : 84}>
      {/* <Column style={{ width: '100%', flex: '1 1' }}>
        <PaddedColumn gap="14px">
          <RowBetween>
            <TitleSearchWindow>{`Transfer to ${currentChain.name} network`}</TitleSearchWindow>
            <StyledCloseIcon onClick={onDismiss} />
          </RowBetween>
          <TitleFrom>{`Choose a token from ${currentChain.name}`}</TitleFrom>
          <StyledInput
            type="text"
            id="token-search-input"
            placeholder={'Search token'}
              value={searchQuery}
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
              onKeyDown={handleEnter}
          />

        </PaddedColumn>
        {tokenList.map((token: any, idx: any) => {
          return (
            <MenuItem
              key={idx}
              style={{
                ...style,
                borderBottom: `none` //${!isEnd ? '1px solid rgba(255,255,255,.035)' : 'none'}`
              }}
              onClick={onDismiss}
              //   className={`token-item-${idx}`}
              //   onClick={() => (isSelected ? null : onSelect())}
              //   disabled={isSelected}
              //   selected={otherSelected}
            >
              {/* <StyledEthereumLogo src={getLogoByName(token.name)} size="30px" style={style} /> */}
 
              {/* <Column>
                <Text title={typeAction === 'Wrap' ? token.name : token.symbol} fontWeight={500}>
                  {typeAction === 'Wrap' ? token.name : token.symbol}
                </Text>
              </Column>
              <RowFixed style={{ justifySelf: 'flex-end' }}>
                {balance ? (
                  <Balance balance={balance} currencyName={token.name} />
                ) : account && balance === undefined ? (
                  <Loader />
                ) : (
                  `${0.00}`
                )}
              </RowFixed>
            </MenuItem>
          )
        })}
      </Column> */} 
    </Modal>
  )
}

export default WrapTokenModal
