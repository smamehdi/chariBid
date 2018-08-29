import React, { Component } from 'react'
import Footer from './footer.js'
import BuyerNavBar from './buyerNavBar.js'
import BuyerHomeDisplay from './buyerHomDisplay.js'
import { Divider } from 'semantic-ui-react'

class BuyerHomePage extends Component {
    render(){
        return (
            <div>
                <div>
                    <BuyerNavBar />
                </div>
                <br/>
                <Divider/>
                <BuyerHomeDisplay />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <Footer />
            </div>
        )
    }
}

export default BuyerHomePage;