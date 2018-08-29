import React, { Component } from 'react';
import OrgSignUp from './OrgSignUp.js';
import { connect } from 'react-redux';
import HomePage from './homePage.js';
import LogIn from './LogIn.js';
import OrgHomePage from './orgHomePage.js';
import CreateListing from './CreateListing.js';
import UserSignUp from './UserSignUp.js';
import BuyerHomePage from './buyerHomePage.js';
import UpdateItemPage from './updateItemPage.js';
import OrgProfile from './orgProfile.js'
import BuyerProfile from './buyerProfile.js'
class MainContainner extends Component {
  componentDidMount () {
    fetch('/home', {
      method: 'GET',
      mode: 'same-origin',
      credentials: 'include'
    }).then(response => response.text())
      .then(responseBody => {
        let answer = JSON.parse(responseBody);
        if (answer.userType === 'org'){
          this.props.dispatch({
            type: 'showOrgPage',
            content: answer.orgId
          })
        }

        if (answer.status && !answer.userType){
          console.log(answer);
          this.props.dispatch({
            type: 'showBuyerPage',
            content: answer.user  
          })
        }
      })
  }
  render() {
    return (
        <div>
            {this.props.shHomepage ? (<HomePage />) : (<div></div>)}
            {this.props.shOrgSignUp ? (<OrgSignUp />) : (<div></div>)}
            {this.props.shBuyerSignUp ? (<UserSignUp />) : (<div></div>)}
            {this.props.shLogIn ? (<LogIn />) : (<div></div>)}
            {this.props.shOrgPage ? (<OrgHomePage />) : (<div></div>)}
            {this.props.shCreateL ? (<CreateListing />) : (<div></div>)}
            {this.props.shBuyerPage ? (<BuyerHomePage />) : (<div></div>)}
            {this.props.shEditItem ? (<UpdateItemPage />) : (<div></div>)}
            {this.props.shOrgProfile ? (<OrgProfile />) : (<div></div>)}
            {this.props.shBuyerProfile ? (<BuyerProfile />) : (<div></div>) }
        </div>
    );
  }
}
let mapStatetoProps = function (state) {
  return {
    shOrgSignUp: state.showOrgSignUp,
    shHomepage: state.showHomepage,
    shBuyerSignUp: state.showBuyerSignUp,
    shLogIn: state.showLogIn,
    shCreateL: state.showCreateListing,
    shOrgPage: state.showOrgPage,
    shBuyerPage: state.showBuyerPage,
    shEditItem: state.showUpdateItemPage,
    shOrgProfile: state.showOrgProfile,
    shBuyerProfile: state.showBuyerProfile
  }
}

let connectedMainContainner = connect(mapStatetoProps)(MainContainner)

export default connectedMainContainner;