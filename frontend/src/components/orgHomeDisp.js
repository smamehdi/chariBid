import React, { Component } from 'react';
import { Segment, Divider, Card, Icon, Image,Grid, Button,Modal, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import Chat from './Chat.js'
import BidLog from './bidLog.js'
import Timer from './timer.js'
import OrgCard from './orgCard.js'

class OrgHomeItemDisp extends Component {
    constructor() {
        super();
        this.state = {toAuction:[], auctioned:[], myItems:[]}
    }
    filterItemsByOrgId = () => {
        fetch('/getItems')
          .then(response => response.text())
          .then(responseBody => {
            let parsedBody = JSON.parse(responseBody);
            let itemList = parsedBody.items;
            this.props.dispatch({
                type: 'getItems',
                content: itemList
            })
            
          }).then(ans => {
            let itemsFiltred = this.props.items.filter(item => item.state === "TO_AUCTION" && item.orgId === this.props.currOrg);
            let itemsAuctioned = this.props.items.filter(item => item.state === "AUCTIONED" && item.orgId === this.props.currOrg)
            this.setState({ toAuction: itemsFiltred, auctioned: itemsAuctioned });
            this.props.dispatch({
                type: 'itemFinished',
                content: itemsAuctioned            
            })
            itemsFiltred.forEach((x) => {
                let item = x
                console.log(
                    new Date(item.bidFinDate).getTime() - Date.now())
                setTimeout(() => {
                    console.log(item)
                    console.log(new Date(item.bidFinDate) - Date.now());
                    let newTA = this.state.toAuction.slice();
                    newTA = newTA.filter(itm => {
                        console.log(item.itemId, itm.itemId)                        
                        return item.itemId !== itm.itemId})
                    let newArr = this.props.fItems.slice();
                    newArr.push(item)

                    this.setState({toAuction: newTA ,auctioned: newArr})
                    this.props.dispatch({
                        type: 'itemFinished',
                        content: itemsAuctioned
                    })

                }, 
               new Date(item.bidFinDate).getTime() - Date.now() < 2000000000 ?

               new Date(item.bidFinDate).getTime() - Date.now() :

               2000000000
                
            )
            });            
          })  
    }
    
    componentDidUpdate(prevProps,prevState){
        if(this.state.toAuction!==prevState.toAuction){
            this.forceUpdate(()=>console.log('remounted'))
        }
    }
    
    handleEditClick = (item) => {
        this.props.dispatch({
            type: 'showEditItem',
            content: item
        })
    }

    handleCloseClick = (item) => {
        fetch('/closeItem', {
            method: 'POST',
            mode: 'same-origin',
            credentials: 'include',
            body:JSON.stringify({'username': this.props.org[0].username, 'itemId': item.itemId})
        })
          .then(response => response.text())
          .then(responseBody => {
              let body = JSON.parse(responseBody);
              let winner = body.winner;
              let taWithout = this.state.toAuction.filter(arrItem => item.itemId !== arrItem.itemId);
              item.winnerUserId = winner.userId;
              let newAuctioned = this.state.auctioned.slice()
              newAuctioned.push(item)

              this.setState({toAuction: taWithout, auctioned: newAuctioned})
          })
    }
    handleCancelClick = (item) => {
        
        let myItems = this.state.toAuction.filter(arrItem => item.itemId !== arrItem.itemId);
        this.setState({toAuction: myItems})
        fetch('/cancelItem', {
            method: 'POST',
            mode: 'same-origin',
            credentials: 'include',
            body: JSON.stringify({'username': this.props.org[0].username ,'itemId': item.itemId})
        })
          .then(response => response.text())
          .then(responseBody => {
              console.log(responseBody);
          })
    }
    formatItems = (x) => {
        if (x === 1) {
            let firstList = this.state.toAuction
            let filteredList = firstList.map((i) => {
                return (
                    
                    <Card>
                        <Image src={'/images/' + i.images} style={{height: '250px', width: '280px'}}/>
                        <Card.Content>
                        <Card.Header>{i.title}</Card.Header>
                            <Card.Meta>{i.description}</Card.Meta>
                            <Card.Description><Timer key={i.itemId} endDate={i.bidFinDate} item={i}/></Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            <Icon name='dollar sign' />
                            Latest bid at : <Header><b>{i.lastPrice}</b></Header>
                        </Card.Content>
                        <Card.Content extra>
                            <Modal size={'large'} trigger={<Button fluid> SEE DETAILS </Button>} closeIcon>
                                <Modal.Header>{i.title}</Modal.Header>
                                <Modal.Content image scrolling>
                                    <Image wrapped size='medium' src={'/images/' + i.images}/>
                                    <Modal.Description>
                                    <Header>Item ID : {i.itemId}</Header>
                                            <h3>Category : {i.category}</h3>
                                            <p>{i.description}</p>
                                            <Divider/>
                                            <h2>Latest Bid at {i.lastPrice} $</h2>
                                            <Divider/>
                                            <h2><Timer endDate={i.bidFinDate} item={i}/></h2>
                                            <br/>
                                            <br/>
                                        <Button.Group>
                                            <Button onClick={ () => this.handleEditClick(i)}>Edit</Button>
                                            <Button onClick={() => this.handleCloseClick(i)}>Close Auction</Button>
                                            <Button onClick={ () => {this.handleCancelClick(i)}}>Cancel Auction</Button>
                                        </Button.Group>
                                        
                                        <BidLog itemId={i.itemId} bids={this.state.bids}/>
                                    </Modal.Description>
                                    <Modal.Description padded>
                                        </Modal.Description >
                                    <Modal.Description padded>
                                    <Segment.Group raised >
                                        <Segment inverted color='black' align='center'><Header>Chat</Header>
                                        <Chat itemId={i.itemId} org={this.props.org} /></Segment>
                                    </Segment.Group>
                                    </Modal.Description>

                                </Modal.Content>
                            </Modal>
                        </Card.Content>
                    </Card>
                    
                )
            })
            let rItems = [];
            for (let i = 0; i < 4; i++) {
                rItems.push(<Grid.Column>{filteredList[i]}</Grid.Column>);
            }
            return rItems;
        } else if (x===2) {
            let firstList = this.state.auctioned
            let filteredList = firstList.map((i) => {
                return (
                    
                    <Card>
                        <Image src={'/images/' + i.images} style={{height: '250px', width: '275px'}} fluid/>
                        <Card.Content>
                        <Card.Header>{i.title}</Card.Header>
                            <Card.Meta>{i.description}</Card.Meta>
                            <Card.Description><Timer key={i.itemId} endDate={i.bidFinDate} item={i}/></Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            <Icon name='dollar sign' />
                            Latest bid at : <Header><b>{i.lastPrice}</b></Header>
                        </Card.Content>
                        <Card.Content extra>
                            <Modal trigger={<Button fluid> See Details </Button>} closeIcon>
                                <Modal.Header>{i.title}</Modal.Header>
                                <Modal.Content image>
                                    <Image wrapped size='medium' src={'/images/' + i.images} />
                                    <Modal.Description>
                                        <Header>Item ID : {i.itemId}</Header>
                                            <h3>Category : {i.category}</h3>
                                            <p>{i.description}</p>
                                            <Divider/>
                                            <h2>Latest Bid at {i.lastPrice} $</h2>
                                            <Divider/>
                                            <h2><Timer endDate={i.bidFinDate} item={i}/></h2>
                                            <br/>
                                            <br/>
                                        
                                        <BidLog itemId={i.itemId} bids={this.state.bids}/>
                                    
                                    </Modal.Description>
                                </Modal.Content>
                            </Modal>
                        </Card.Content>
                    </Card>
                    
                )
            })
            let rItems = [];
            for (let i = 0; i < 4; i++) {
                rItems.push(<Grid.Column>{filteredList[i]}</Grid.Column>);
            }
            return rItems;
        }
       
    }

    longPoll = () => setInterval(this.fetchCurrentItems, 10000) 
    fetchCurrentItems = () => {
        fetch('/getItems')
            .then(response => response.text())
            .then(responseBody => {
                let body = JSON.parse(responseBody)
                let items = body.items;
                this.setState({myItems: items})
            })
        this.filterItemsByOrgId();
    }
    componentDidMount() {
       this.longPoll()
       this.filterItemsByOrgId();
    }

    componentWillUnmount() {
        clearInterval(this.longPoll)
    }
    render() {
        //{this.filterItemsByOrgId}
        return(
        <div>
            <Grid>
            <Grid.Column></Grid.Column>
                <Grid.Column width={2}>
          
            <OrgCard/>
          <br/>
                </Grid.Column>
                <Grid.Column stretched width={12}>
                <Segment color='blue'>
                <Header as='h2' icon={<Icon loading size='big' name='stopwatch' color='blue' />} content='Your Products Currently Bidding' />
                 <Divider/>         
            <div>
                <Grid relaxed='very' columns={4}>
                {this.formatItems(1)}
                </Grid>
            </div>
            </Segment>
          
          
          <Segment color='orange'>
          <Header as='h2' icon={<Icon loading size='big' name='legal' color='orange' />} content='Your Sold Products' />
          <Divider/>
          
            <div>
                <Grid relaxed='very' columns={4}>
                {this.formatItems(2)}
                </Grid>
            </div>
            </Segment>
          </Grid.Column>
          </Grid>
          <br/>
          <br/>

        </div>

        )
    }
}

function mapStateToProps(state) {
    return {
        items: state.items,
        currOrg : state.orgId,
        org: state.currentOrg,
        fItems : state.finishedItems
    }
}
export default connect(mapStateToProps)(OrgHomeItemDisp);