import { ETHER_CURRENCIES, ChainId, Currency, CurrencyAmount, JSBI, Percent, Token } from '@zeroexchange/sdk'

import {
  AVAX_ROUTER_ADDRESS, ETH_ROUTER_ADDRESS, SMART_CHAIN_ROUTER_ADDRESS,
  MOONBASE_ROUTER_ADDRESS, MUMBAI_ROUTER_ADDRESS, MATIC_ROUTER_ADDRESS, HECO_ROUTER_ADDRESS, MOONRIVER_ROUTER_ADDRESS, FANTOM_ROUTER_ADDRESS
} from '../constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'

import { AddressZero } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { TokenAddressMap } from '../state/lists/hooks'
import { getAddress } from '@ethersproject/address'
import { getCrosschainState } from 'state/crosschain/hooks'

const { currentChain } = getCrosschainState()
// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  if (value) {
    try {
      return getAddress(value)
    } catch (e) {
      return false
    }
  }
  return false
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {

  let prefix = currentChain?.blockExplorer
  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getRouterContract(chainId: ChainId, library: Web3Provider, account?: string): Contract {
  return getContract(
    chainId === ChainId.MAINNET || chainId === ChainId.RINKEBY
      ? ETH_ROUTER_ADDRESS
      : chainId === ChainId.SMART_CHAIN || chainId === ChainId.SMART_CHAIN_TEST
        ? SMART_CHAIN_ROUTER_ADDRESS
        : chainId === ChainId.MOONBASE_ALPHA
          ? MOONBASE_ROUTER_ADDRESS
          : chainId === ChainId.MUMBAI
            ? MUMBAI_ROUTER_ADDRESS
            : chainId === ChainId.MATIC
              ? MATIC_ROUTER_ADDRESS
              : chainId === ChainId.HECO
                ? HECO_ROUTER_ADDRESS
                : chainId === ChainId.MOONRIVER
                  ? MOONRIVER_ROUTER_ADDRESS
                  : chainId === ChainId.FANTOM
                    ? FANTOM_ROUTER_ADDRESS
                    : AVAX_ROUTER_ADDRESS,
    IUniswapV2Router02ABI,
    library,
    account
  )
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  return currency && ETHER_CURRENCIES.includes(currency) ? true :
    Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export const copyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

export const wait = (time: number) =>
  new Promise(resolve => {
    setTimeout(resolve, time * 1000)
  })
