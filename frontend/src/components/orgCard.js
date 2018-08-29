import React, { Component } from 'react'
import { List, Card, Image, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'


class OrgCard extends Component {
    constructor() {
        super();
    }


    handleSettings = () => {
        this.props.dispatch({
            type: 'showOrgProfile',
            content: true
        })
    }

    render() {
            if (this.props.liveOrg[0] !== undefined) {return (
                <div>
            <Card>
                <Image src={'/images/'+this.props.liveOrg[0].logo}/>
                <Card.Content>
                <Card.Header>{this.props.liveOrg[0].orgName}</Card.Header>
                <Card.Meta><a href={this.props.liveOrg[0].website}>{this.props.liveOrg[0].website}</a></Card.Meta>
                <Card.Description>
                    {this.props.liveOrg[0].description}
                    <br/>
                    <br/><br/>
                    <List>
                        <List.Item>
                        <List.Icon name='marker' />
                        <List.Content>{this.props.liveOrg[0].postalCode}, {this.props.liveOrg[0].country}</List.Content>
                        </List.Item>
                        <List.Item>
                        <List.Icon name='mail' />
                        <List.Content>
                            <a href={'mailto:'+this.props.liveOrg[0].email}>{this.props.liveOrg[0].email}</a>
                        </List.Content>
                        </List.Item>
                        <List.Item>
                        <List.Icon name='linkify' />
                        <List.Content>
                            <a href={this.props.liveOrg[0].website}>{this.props.liveOrg[0].website}</a>
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
                    <Button fluid onClick={this.handleSettings}>Edit Profile</Button>
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
function mapStateToProps(state) {
    return {
        items: state.items,
        currOrg : state.orgId,
        liveOrg: state.currentOrg,
    }
}
export default connect(mapStateToProps)(OrgCard);

