import React, { Component } from 'react'
import { Message, Modal, Header, Form, Grid, List, Card, Image, Button } from 'semantic-ui-react'



class ItemOrgCard extends Component {
    constructor(props) {
        super(props);
        this.state = {selectOrg:'', open:false, donate:false}
    }

    getOrg = () => {
        fetch('/getOrgs')
            .then(response => response.text())
            .then(responseBody => {
                let body = JSON.parse(responseBody);
                let selOrg = body.orgs.filter(org => org.orgId === this.props.chosenOrgId)
                console.log(selOrg)
                this.setState({ selectOrg: selOrg})
            })
    }
    componentDidMount() {
        this.getOrg()
    }


    show = dimmer => () => this.setState({ dimmer, open: true })
    close = () => this.setState({ open: false })
    acceptDonation = () => this.setState({donate:true})
      
          
          
  

        
    render() {
            const { open, dimmer } = this.state
            if (this.state.selectOrg[0] !== undefined) {return (
                <div>
            <Card>
                <Image src={'/images/'+this.state.selectOrg[0].logo}/>
                <Card.Content>
                <Card.Header>{this.state.selectOrg[0].orgName}</Card.Header>
                <Card.Meta><a href={this.state.selectOrg[0].website}>{this.state.selectOrg[0].website}</a></Card.Meta>
                <Card.Description>
                    {this.state.selectOrg[0].description}
                    <br/>
                    <br/><br/>
                    <List>
                        <List.Item>
                        <List.Icon name='marker' />
                        <List.Content>{this.state.selectOrg[0].postalCode}, {this.state.selectOrg[0].country}</List.Content>
                        </List.Item>
                        <List.Item>
                        <List.Icon name='mail' />
                        <List.Content>
                            <a href={'mailto:'+this.state.selectOrg[0].email}>{this.state.selectOrg[0].email}</a>
                        </List.Content>
                        </List.Item>
                        <List.Item>
                        <List.Icon name='linkify' />
                        <List.Content>
                            <a href={this.state.selectOrg[0].website}>{this.state.selectOrg[0].website}</a>
                        </List.Content>
                        </List.Item>
                    </List>
                    <br/>
                    <br/>
                    <div>
                        <Button circular color='facebook' icon='facebook' />
                        <Button circular color='twitter' icon='twitter' />
                        <Button circular color='linkedin' icon='linkedin' />
                        <Button circular color='google plus' icon='google plus' />
                    </div>
                </Card.Description>
                </Card.Content>
                <Card.Content extra>                   
                    <Button fluid color='blue' onClick={this.show('inverted')}>Donate</Button>
                    {this.state.donate ? (<Message warning color="green">
                        <Message.Header>Thank you for your donation!</Message.Header>
                    </Message>) : (<div></div>)}
                    <Modal dimmer={dimmer} open={open} onClose={this.close}>
                        <Modal.Header>Donation Confirmation</Modal.Header>
                        <Modal.Content image>
                        <Image wrapped size='medium' src={'/images/'+this.state.selectOrg[0].logo} />
                        <Modal.Description>
                            <Header>What really matters is giving back!</Header>
                            <p>Please Note : The billing information used to process payment will be used from the one you provided at sign up</p>
                            <Form centered size='large'>
                                <Grid>
                                    <Grid.Row centered columns={1}>
                                    <Grid.Column centered>
                                    <Form.Group unstackable widths='equal'>
                                        <Form.Input required
                                        icon='credit card' iconPosition='left'
                                        name='credit'
                                        label='Credit Card Number'
                                        placeholder='XXXX XXXX XXXX XXXX'
                                        />
                                        </Form.Group>
                                        </Grid.Column>
                                        </Grid.Row>
                                    <Grid.Row centered columns={1}>
                                    <Grid.Column centered>
                                    <Form.Group widths='equal'>
                                    <Form.Input required
                                        name='expiry'
                                        label='Expiry Date'
                                        placeholder='MM / YY'
                                        />
                                        <Form.Input required
                                        icon='credit card outline' iconPosition='left'
                                        name='cvv'
                                        label='CVV'
                                        placeholder='CVV'
                                        />
                                        </Form.Group>
                                    </Grid.Column>
                                    </Grid.Row>
                                    </Grid>
                            </Form>
                        </Modal.Description>
                        </Modal.Content>
                        <Modal.Actions>
                        <Button color='black' onClick={this.close}>
                            Cancel
                        </Button>
                        <Button
                            positive
                            icon='checkmark'
                            labelPosition='right'
                            content="Process Donation"
                            onClick={() => {this.close();this.acceptDonation()}}
                        />
                        </Modal.Actions>
                    </Modal>
                </Card.Content>
            </Card>
          </div>
            )} else {
                return (
                    <div></div>
                )
            }
    }
}

export default ItemOrgCard;

