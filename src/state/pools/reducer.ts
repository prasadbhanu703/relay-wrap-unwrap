import { createReducer } from '@reduxjs/toolkit'

import {
  setAprData,
  AprObjectProps,
  setPoolsData,
  setToggle,
  setStackingInfo,
  replacePoolsState,
  setPoolEarnings
} from './actions'

export interface PoolsState {
  aprData: AprObjectProps[]
  poolsData: any[]
  isTouchable: boolean
  poolStackingInfo: any[]
  weeklyEarnings: object
  readyForHarvest: object
  totalLiquidity: object
  weeklyEarningsTotalValue: any
  readyForHarvestTotalValue: any
}

const initialState: PoolsState = {
  aprData: [],
  poolsData: [],
  isTouchable: false,
  poolStackingInfo: [],
  weeklyEarnings: {},
  readyForHarvest: {},
  totalLiquidity: {},
  weeklyEarningsTotalValue: null,
  readyForHarvestTotalValue: null
}

export default createReducer<PoolsState>(initialState, builder =>
  builder
    .addCase(setAprData, (state, { payload: { aprData } }) => {
      return {
        ...state,
        aprData
      }
    })
    .addCase(setPoolsData, (state, { payload: { poolsData } }) => {
      return {
        ...state,
        poolsData
      }
    })
    .addCase(setToggle, (state, { payload: { isTouchable } }) => {
      return {
        ...state,
        isTouchable
      }
    })
    .addCase(setStackingInfo, (state, { payload: { poolStackingInfo } }) => {
      return {
        ...state,
        poolStackingInfo
      }
    })
    .addCase(
      replacePoolsState,
      (state, { payload: { singleWeeklyEarnings, readyToHarvest, liquidityValue, contract } }) => {
        return {
          ...state,
          weeklyEarnings: { ...state.weeklyEarnings, [contract]: singleWeeklyEarnings },
          readyForHarvest: { ...state.readyForHarvest, [contract]: readyToHarvest },
          totalLiquidity: { ...state.totalLiquidity, [contract]: liquidityValue }
        }
      }
    )
    .addCase(setPoolEarnings, (state, { payload: { weeklyEarningsTotalValue, readyForHarvestTotalValue } }) => {
      return {
        ...state,
        weeklyEarningsTotalValue: weeklyEarningsTotalValue,
        readyForHarvestTotalValue: readyForHarvestTotalValue
      }
    })
)
