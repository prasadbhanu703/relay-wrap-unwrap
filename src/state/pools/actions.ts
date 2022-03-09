import { createAction } from '@reduxjs/toolkit'

export type AprObjectProps = {
  APY: number
  name: String
  chain: String
  contract_addr: String
}

export const setAprData = createAction<{ aprData: AprObjectProps[] }>('pools/setAprData') //apr data api
export const setPoolsData = createAction<{ poolsData: any[] }>('pools/setPoolsData') // arrayToShow
export const setToggle = createAction<{ isTouchable: boolean }>('pools/setToggle') // isTouchable
export const setStackingInfo = createAction<{ poolStackingInfo: any[] }>('pools/setStackingInfo') // stackingInfo
export const replacePoolsState = createAction<{
  singleWeeklyEarnings: any
  readyToHarvest: any
  liquidityValue: any
  contract: any
}>('pools/replacePoolsState')

export const setPoolEarnings = createAction<{
  weeklyEarningsTotalValue: any
  readyForHarvestTotalValue: any  
}>('pools/setPoolEarnings')
