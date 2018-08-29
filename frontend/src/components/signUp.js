import React, { Component } from 'react'
import { Segment, Button, Divider, Modal, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import OrgSignUp from './OrgSignUp.js'
import UserSignUp from './UserSignUp.js'

class SignUp extends Component {
  constructor () {
    super();
    this.state = {open: false}
    this.handleNP = this.handleNP.bind(this)
    this.handleBuyer = this.handleBuyer.bind(this)

  }
  show = size => () => this.setState({ size, open: true })
  close = () => this.setState({ open: false })
  handleNP () {
    this.props.dispatch({
      type: 'orgSignUp',
      content: true
    })
  }

  handleBuyer() {
    this.props.dispatch({
      type: 'buyerSignUp',
      content: true
    })
  }
  render() {
    const { open, size } = this.state
    return (
      <Segment padded>
        
        <Modal trigger={<Button fluid primary onClick={this.show('tiny')}
        size={size} open={open} onClose={this.close}>
          User Sign Up
        </Button>}>
        <Modal.Header><Header as='h2' style={{textAlign: 'center'}}>User Sign Up</Header></Modal.Header>
              <Modal.Content>
                <UserSignUp />
              </Modal.Content>
        </Modal>
        <Divider horizontal>Or</Divider>
        <Modal trigger={<Button fluid secondary>
          Non-Profit Sign Up
        </Button>}>
        <Modal.Header><Header as='h2' style={{textAlign: 'center'}}>Non-Profit Sign Up</Header></Modal.Header>
              <Modal.Content>
                <OrgSignUp />
              </Modal.Content>
        </Modal>
      </Segment>
    );
  }
 }

let ConnectedSignUp = connect()(SignUp)
export default ConnectedSignUp;