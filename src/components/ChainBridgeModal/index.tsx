import ChainBridgeItem from './ChainBridgeItem'
import { CloseIcon } from '../../theme/components'
import Modal from '../Modal'
import React from 'react'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { useCrosschainState } from '../../state/crosschain/hooks'

interface ChainBridgeProps {
  isOpen: boolean
  onDismiss: () => void
  pendingTransfer?: any
}

const ModalContainer = styled.div`
  padding: 1.5rem;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  h5 {
    font-weight: bold;
    margin-bottom: 1rem;
    display: block;
    text-align: center;
    margin-top: 1rem;
    font-size: 1rem;
  }
`

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
`

export default function ChainBridgeModal({ isOpen, onDismiss }: ChainBridgeProps) {
  const { pendingTransfer } = useCrosschainState()

  // if (!pendingTransfer?.amount) {
  //   onDismiss()
  // }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80}>
      <ModalContainer>
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        {pendingTransfer?.amount ? (
          <>
            <h5>Pending Cross-Chain Transfer:</h5>
            <ListContainer>
              {
                // @ts-ignore
                <ChainBridgeItem item={pendingTransfer}></ChainBridgeItem>
              }
            </ListContainer>
          </>
        ) : (
          <>
            <h5>No pending transfers</h5>
          </>
        )}
      </ModalContainer>
    </Modal>
  )
}
