import { CloseIcon } from '../../theme'
import { Currency, ETHER, Token } from '@zeroexchange/sdk'
import { PaddedColumn, SearchInput, Separator } from './styleds'
import React, { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RowBetween } from '../Row'
import { useAllTokens, useToken } from '../../hooks/Tokens'

import AutoSizer from 'react-virtualized-auto-sizer'
import Column from '../Column'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import { FixedSizeList } from 'react-window'
import QuestionHelper from '../QuestionHelper'
import SortButton from './SortButton'
import { Text } from 'rebass'
import { filterTokens } from './filtering'
import { isAddress } from '../../utils'
import { useActiveWeb3React } from '../../hooks'
import { useTokenComparator } from './sorting'
import { useTranslation } from 'react-i18next'

interface BlockchainSearchProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  onChangeList: () => void
}

export function BlockchainSearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  onChangeList
}: BlockchainSearchProps) {
  const { t } = useTranslation()
  const { chainId } = useActiveWeb3React()

  const fixedList = useRef<FixedSizeList>()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false)
  const allTokens = useAllTokens()

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  useEffect(() => {
    if (isAddressSearch) {
     console.log('isAddressSearch:>> ', isAddressSearch);
    }
  }, [isAddressSearch])

  const showETH: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim()
    return s === '' || s === 'e' || s === 'et' || s === 'eth'
  }, [searchQuery])

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : []
    return filterTokens(Object.values(allTokens), searchQuery)
  }, [isAddressSearch, searchToken, allTokens, searchQuery])

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken]
    const sorted = filteredTokens.sort(tokenComparator)
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0)
    if (symbolMatch.length > 1) return sorted

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0])
    ]
  }, [filteredTokens, searchQuery, searchToken, tokenComparator])

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelect]
  )

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('')
  }, [isOpen])

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = searchQuery.toLowerCase().trim()
        if (s === 'eth') {
          handleCurrencySelect(ETHER)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, searchQuery]
  )

  return (
    <Column style={{ width: '100%', flex: '1 1' }}>
      <PaddedColumn gap="14px">
        <RowBetween>
          <Text fontWeight={500} fontSize={16}>
            Select a Blockchain
            <QuestionHelper text="Find a blockchain by searching for its name or symbol or by pasting its address below." />
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <SearchInput
          type="text"
          id="token-search-input"
          placeholder={t('tokenSearchPlaceholder')}
          value={searchQuery}
          ref={inputRef as RefObject<HTMLInputElement>}
          onChange={handleInput}
          onKeyDown={handleEnter}
        />
        {showCommonBases && (
          <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
        )}
        <RowBetween>
          <Text fontSize={14} fontWeight={500}>
            Blockchain Name
          </Text>
          <SortButton ascending={invertSearchOrder} toggleSortOrder={() => setInvertSearchOrder(iso => !iso)} />
        </RowBetween>
      </PaddedColumn>

      <Separator />

      <div style={{ flex: '1' }}>
        <AutoSizer disableWidth>
          {({ height }) => (
            <CurrencyList
              height={height}
              showETH={showETH}
              currencies={filteredSortedTokens}
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
              searchQuery={searchQuery}
              isAscendingFilter={invertSearchOrder}
            />
          )}
        </AutoSizer>
      </div>

      <Separator />
    </Column>
  )
}
