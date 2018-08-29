import React, { Component } from 'react'
import { Image, Input, Menu, Button, Dropdown } from 'semantic-ui-react'
import { connect } from 'react-redux'


class OrgNavBar extends Component {
  constructor() {
    super();
    this.state = { org : '', signUpClick: false} 
    this.getOrgs = this.getOrgs.bind(this);
    this.handleListingClick = this.handleListingClick.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.handleSettings = this.handleSettings.bind(this);
  }
  getOrgs() {
    fetch('/getOrgs')
      .then(response => response.text())
      .then(responseBody => {
        let parsedBody = JSON.parse(responseBody);
        let orgLoggedIn = parsedBody.orgs.filter(org => org.orgId === this.props.orgId);
        this.props.dispatch({
            type: 'getorgs',
            content: orgLoggedIn.orgId
        })
        this.props.dispatch({
            type: 'setOrg',
            content: orgLoggedIn
        })
        let singleOrgLogged = orgLoggedIn[0]
        this.setState({ org: singleOrgLogged });     
      })        
    }
    handleListingClick(){
        this.props.dispatch({
            type: 'showCreateL',
            content: true
        })
    }

    handleLogOut() {
        fetch('/logout', {
            method: 'POST',
            mode: 'same-origin',
            credentials: 'include',
            body: JSON.stringify({username: this.props.org[0].username})
        })
        .then(response => response.text())
        .then(responseBody => {
            let body = JSON.parse(responseBody)
            console.log(body)
            this.props.dispatch({
                type: 'homepage',
                content: true
            })
        })

    }

    handleSettings(){
        this.props.dispatch({
            type: 'showOrgProfile',
            content: true
        })
    }

  componentDidMount() {
      this.getOrgs();
  }
  render() {
    const options = [
        { key: 1, text: 'Settings', value: 1, onClick: this.handleSettings },
        { key: 2, text: 'Logout', value: 2, onClick: this.handleLogOut},
    ]
    const { activeItem } = this.state
    return (
        <div>
            <div>
            <Menu inverted position="fixed" borderless>
        <Menu.Item>
        <Image src='./images/charibidlogo.png' size="small"/>
        </Menu.Item>
        <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick} />
        <Menu.Menu position='right'>
            <Menu.Item>
                <Button positive onClick={this.handleListingClick}>Create New Listing</Button>
            </Menu.Item>
            <Menu.Item>
                <Input icon='search' placeholder='Search...' />
            </Menu.Item>
        </Menu.Menu>
            <Dropdown item simple text={this.state.org.username} direction='right' options={options} />
        </Menu>
        </div>
      </div>
    )
    
  }
}

function mapStateToProps(state) {
    return {
        orgId: state.orgId,
        org: state.currentOrg
    }
}
let ConnectedOrgNavBar = connect(mapStateToProps)(OrgNavBar)

export default ConnectedOrgNavBar;
