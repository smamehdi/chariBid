import React, { Component } from 'react';
import ConnectedOrgNavBar from './orgNavBar.js'
import Footer from './footer.js'
import OrgHomeItemDisp from './orgHomeDisp.js'
import BuyerHomeDisplay from './buyerHomDisplay.js'
import { Icon, Segment, Header ,Divider} from 'semantic-ui-react'


class OrgHomePage extends Component {
  render() {
    return (
      <div className="App">
        <div>
          <ConnectedOrgNavBar/>
          </div>
          
        <Header as='h2' icon='smile' content='Welcome back !' textAlign='center'/>
                <Divider/>
        <div>
          <OrgHomeItemDisp />

        </div>
        <div>
         
          <Segment inverted>
          <Header as='h2' icon={<Icon loading size='big' name='globe' color='white' />} content='Shop All Products' textAlign='center'/>
          </Segment>
          

          
          <BuyerHomeDisplay/>
        </div>
        <Footer/>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
      items: state.items,
      currOrg : state.orgId,
      org: state.currentOrg,
  }
}
export default OrgHomePage;