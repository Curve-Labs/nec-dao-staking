import React, { Component } from 'react'
import * as providerService from 'core/services/providerService'
import * as bPoolService from 'core/services/bPoolService'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import LogTable from 'components/LogTable'
import PoolTitleCard from 'components/PoolTitleCard'

class LogView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      address: '',
      provider: null,
      logData: {},
      logsLoaded: false,
      pendingRequest: false,
      requestError: null
    }
  }

  async componentWillMount() {
    const { address } = this.props.match.params
    this.setState({ address })
  }

  render() {
    const { address } = this.state
    const { poolStore } = this.props.root

    if (!logsLoaded) {
      return <div />
    }

    return (
      <Container>
        <Typography variant="h3" component="h3">Call Logs</Typography>
        <br />
        <PoolTitleCard address={address} pool={{}} />
        <br />
        {logsLoaded ? (
          <LogTable logData={logData} />
        ) : (
            <div />
          )}
        <br />
      </Container>
    )
  }
}

export default LogView
