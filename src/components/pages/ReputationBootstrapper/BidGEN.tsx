import React from 'react'
import styled from 'styled-components'
import { observer, inject } from 'mobx-react'
import GenAuctionTable from 'components/tables/GenAuctionTable'
import TimelineProgress from 'components/common/TimelineProgress'
import EnableTokenPanel from 'components/panels/EnableTokenPanel'
import BidPanel from 'components/panels/BidPanel'
import LogoAndText from 'components/common/LogoAndText'
// TODO: change to GEN
import GENLogo from 'assets/svgs/GEN-logo.svg'
import * as helpers from 'utils/helpers'
import { deployed } from 'config.json'
import LoadingCircle from '../../common/LoadingCircle'
import { RootStore } from 'stores/Root'
import { instructions, tooltip } from 'strings'
import TokenValue from 'components/common/TokenValue'

const BidGENWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-height: 500px;Screenshot from 2019-10-08 23-01-15
`

const DetailsWrapper = styled.div`
  min-width: 605px;
  border-right: 1px solid var(--border);
`

const TableHeaderWrapper = styled.div`
  height: 103px
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 24px;
  border-bottom: 1px solid var(--border);
`
const ActionsWrapper = styled.div`
  width: 324px;
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
`
const ActionsHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  margin: 0px 24px;
  color: var(--white-text);
  border-bottom: 1px solid var(--border);
`

@inject('root')
@observer
class BidGEN extends React.Component<any, any>{
  SidePanel = () => {
    const { bidGENStore, tokenStore, providerStore } = this.props.root as RootStore
    const userAddress = providerStore.getDefaultAccount()
    const genTokenAddress = deployed.GenToken
    const spenderAddress = deployed.Auction4Reputation

    const tokenApproved = tokenStore.hasMaxApproval(genTokenAddress, userAddress, spenderAddress)

    const approvePending = tokenStore.isApprovePending(genTokenAddress, userAddress, spenderAddress)
    const bidPending = bidGENStore.isBidActionPending()

    return (
      <React.Fragment>
        {tokenApproved === false ?
          <EnableTokenPanel
            instruction={instructions.enableBid}
            pendingInstruction={instructions.pending.enableBid}
            subinstructions="-"
            buttonText="Enable GEN"
            tokenAddress={genTokenAddress}
            spenderAddress={spenderAddress}
            enabled={tokenApproved}
            pending={approvePending}
          /> :
          <div>
            <BidPanel
              instruction="Enable NEC for locking"
              subinstruction="-"
              buttonText="Bid GEN"
              userAddress={userAddress}
              tokenAddress={genTokenAddress}
              spenderAddress={spenderAddress}
              pending={bidPending}
            />
          </div>
        }
      </React.Fragment >
    )
  }

  /*
    If we're before the last auction:
    'Next auction starts in + time'

    If we're in the last auction:
    'Last auction ends in + time'

    If we're after the last auction conclusion:
    'Auctions have ended'
  */
  getAuctionPercentageAndTimer() {
    const { bidGENStore } = this.props.root as RootStore

    const currentAuction = bidGENStore.getActiveAuction()
    const finalAuction = bidGENStore.getFinalAuctionIndex()
    const timeUntilNextAuction = bidGENStore.getTimeUntilNextAuction()
    const auctionLength = bidGENStore.staticParams.auctionLength

    const auctionsStarted = bidGENStore.haveAuctionsStarted()
    const auctionsEnded = bidGENStore.areAuctionsOver()

    let auctionPercentage = 0
    let auctionTimer = '...'

    const finalAuctionDisplay = finalAuction + 1
    const currentAuctionDisplay = (currentAuction >= finalAuction ? finalAuctionDisplay : currentAuction + 1)

    let prefix = 'Next in'
    let auctionTitle = `Current Auction: ${currentAuctionDisplay} of ${finalAuctionDisplay}`

    if (!auctionsStarted) {
      auctionPercentage = 0
      prefix = 'First in'
      auctionTitle = "Auctions not started"
    }

    if (currentAuction === finalAuction) {
      prefix = 'Ends in'
    }

    if (auctionsEnded) {
      auctionPercentage = 100
      auctionTitle = 'Auctions have ended'
      auctionTimer = ''
    }

    if (!auctionsEnded) {
      auctionPercentage = (timeUntilNextAuction / auctionLength) * 100
      const timeUntilNext = helpers.formatTimeRemaining(timeUntilNextAuction)
      auctionTimer = `${prefix} ${timeUntilNext}`
    }

    return {
      auctionPercentage,
      auctionTimer,
      auctionTitle
    }
  }

  render() {
    const { bidGENStore, tokenStore, providerStore } = this.props.root as RootStore

    const userAddress = providerStore.getDefaultAccount()
    const genTokenAddress = deployed.GenToken
    const schemeAddress = deployed.Auction4Reputation

    // Loading Status
    const staticParamsLoaded = bidGENStore.areStaticParamsLoaded()
    const auctionDataLoaded = bidGENStore.isAuctionDataLoaded()
    const hasBalance = tokenStore.hasBalance(genTokenAddress, userAddress)
    const hasAllowance = tokenStore.hasAllowance(genTokenAddress, userAddress, schemeAddress)

    if (!staticParamsLoaded || !hasBalance || !hasAllowance) {
      return (<LoadingCircle instruction={'Loading...'} subinstruction={''} />)
    }

    const auctionData = bidGENStore.auctionData
    const genBalance = tokenStore.getBalance(genTokenAddress, userAddress)
    const genBalanceDisplay = helpers.tokenDisplay(genBalance)

    const auctionDisplayInfo = this.getAuctionPercentageAndTimer()
    const { auctionPercentage, auctionTimer, auctionTitle } = auctionDisplayInfo

    return (
      <BidGENWrapper>
        <DetailsWrapper>
          <TableHeaderWrapper>
            <TimelineProgress
              value={auctionPercentage}
              title={auctionTitle}
              subtitle={auctionTimer}
              width="28px"
              height="28px"
              displayTooltip={true}
              tooltipContent={tooltip.bidExplainer}
            />
          </TableHeaderWrapper>
          <GenAuctionTable
            highlightTopRow
            data={auctionData}
            dataLoaded={auctionDataLoaded}
          />
        </DetailsWrapper>
        <ActionsWrapper>
          <ActionsHeader>
            <LogoAndText icon={GENLogo} text="GEN" />
            <TokenValue weiValue={genBalance} tokenName='GEN' />
          </ActionsHeader>
          {this.SidePanel()}
        </ActionsWrapper>
      </BidGENWrapper >
    )
  }
}

export default BidGEN
