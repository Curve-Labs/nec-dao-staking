import React, { Component } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField
} from '@material-ui/core'
import { observer, inject } from 'mobx-react'

import { Button } from '../../components'

@inject('root')
@observer
class PoolCreatorView extends Component {
  constructor(props) {
    super(props)
  }

  async componentWillMount() {
    const { providerStore } = this.props.root
    if (!providerStore.defaultAccount) {
      await providerStore.setWeb3WebClient()
    }
  }

  render() {
    const { poolStore } = this.props.root
    const handleSubmit = async () => {
      console.log('submit')
      await poolStore.deployPool()
    }
    return (
      <Container>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h5">New Pool Description</Typography>
                  <TextField
                    id="standard-multiline-static"
                    multiline
                    rows="4"
                    placeholder="Some new pool description"
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained">Deploy New Pool</Button>
            </Grid>
          </Grid>
        </form>

      </Container>
    )
  }
}

export default PoolCreatorView
