import React, { Component } from 'react'
import { Form, Grid, Header, Card, Icon, Modal, Button, Image } from "semantic-ui-react";
import ConnectedBuyerNavBar from './buyerNavBar.js'
import Footer from './footer.js'
import { connect } from 'react-redux'

class BuyerProfile extends Component {
    constructor() {
        super();
        this.state = {
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            wonItems: [],
            lostItems: [],
            transactions: []
        }
        this.getUserPro = this.getUserPro.bind(this);
    }

    getUserPro() {
        fetch('/getUserProfile', {
            method: 'POST',
            mode: 'same-origin',
            credentials: 'include',
            body: JSON.stringify({ username: this.props.byr.username, userId: this.props.byrId })
        })
            .then(response => response.text())
            .then(responseBody => {
                let body = JSON.parse(responseBody)
                this.setState({ wonItems: body.wonItems, lostItems: body.lostItems, transactions: body.transactions })
            })
    }

    formatItems(array) {
        let formated = array.map(item => {
            return (
                <Card>
                    <Image src={'/images/' + item.images} />
                    <Card.Content>
                        <Card.Header>{item.title}</Card.Header>
                        <Card.Meta>Bid Ended: {item.bidFinDate}</Card.Meta>
                        <Card.Description>{item.description}</Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <Icon name='dollar sign' />
                        {item.lastPrice}
                    </Card.Content>
                    <Card.Content extra>
                        <Modal trigger={<Button fluid> See Details </Button>} closeIcon>
                            <Modal.Header>{item.title}</Modal.Header>
                            <Modal.Content image>
                                <Image wrapped size='medium' src={'/images/' + item.images} />
                                <Modal.Description>
                                    <Header>Item ID : {item.itemId}</Header>
                                    <h3>Category : {item.category}</h3>
                                    <p>{item.description}</p>
                                    <h2>Ended: {item.bidFinDate}</h2>

                                </Modal.Description>
                            </Modal.Content>
                        </Modal>
                    </Card.Content>
                </Card>
            );
        })
        return formated;
    }
    // on change of any field (found at semantic ui Form documentation)
    componentDidMount() {
        this.getUserPro();
    }
    render() {
        return (
            <div>
                <ConnectedBuyerNavBar />
                <br />
                <br />
                
                <Header as='h3' icon='star' content='Won items:' />
                <Grid relaxed='very' columns={4}>
                    {this.formatItems(this.state.wonItems).map(item => <Grid.Column>{item}</Grid.Column>)}
                </Grid>

                <Header as='h3' icon='star outline' content='Lost items:' />
                <Grid relaxed='very' columns={4}>
                    {this.formatItems(this.state.lostItems).map(item => <Grid.Column>{item}</Grid.Column>)}
                </Grid>

                <Header as='h3' icon='money bill alternate' content='Transactions:' />
                <Grid relaxed='very' columns={4}>
                    {this.formatItems(this.state.transactions).map(item => <Grid.Column>{item}</Grid.Column>)}
                </Grid>
                <br />
                <br />
                <Footer />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        byr: state.currentBuyer,
        byrId: state.buyerId
    }
}

export default connect(mapStateToProps)(BuyerProfile);