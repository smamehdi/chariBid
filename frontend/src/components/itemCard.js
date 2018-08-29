import React, {Component} from 'react'

class ItemCard extends Component {
    constructor(props) {
        super(props);
        this.state = {items:[],randomItems:[]}
        this.getItems = this.getItems.bind(this)
    }
    getItems() {
        fetch('/getItems')
          .then(response => response.text())
          .then(responseBody => {
            let parsedBody = JSON.parse(responseBody);
            let itemList = parsedBody.items;
            this.props.dispatch({
                type: 'getItems',
                content: itemList
            })

            let itemsFiltred = this.props.items.filter(item => item.orgId === this.props.orgId);
            this.setState({ items:itemList, randomItems: itemsFiltred });     
          })        
    }
    formatItems = () => {
        let firstList = this.state.randomItems
        let filteredList = firstList.map((i) => {
            return (
                <div>
                <Grid.Column>
                <Card>
                    <Image src={i.images[0]} />
                    <Card.Content>
                    <Card.Header>{i.title}</Card.Header>
                    <Card.Meta>Bid Ends: {i.bidFinDate}</Card.Meta>
                    <Card.Description>{i.description}</Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <Icon name='dollar sign' />
                        {i.lastPrice}
                    </Card.Content>
                    <Card.Content extra>
                        <Button fluid> Bid NOW! </Button>
                    </Card.Content>
                </Card>
                </Grid.Column>
                </div>
            )
        })
        return filteredList;
    }
    componentDidMount() {
        this.getItems();
    }
    render() {
        return(
            <div>
                {this.formatItems()}
            </div>
        )
    }
}
function mapStateToProps(state) {
    return {
        items: state.items,
        orgId: state.orgId
    }
}
export default connect(mapStateToProps)(ItemCard);