import React, { Component } from 'react';
import NavBar from './navBar.js'
import HeroSlider from './heroSlider.js'
import Footer from './footer.js'
import HomeItemDisp from './itemsHomeDisp.js'
import { Header } from 'semantic-ui-react'


class HomePage extends Component {
  render() {
    return (
      <div className="App">
        <div>
          <NavBar/>
        </div>
        <div>
          <HeroSlider/>
        </div>
        <div>
          <div>
            <br/>
              <Header as='h2' icon='stopwatch' content='Products Currently in Auction' />
            <br/>
            <br/>
          </div>
          <HomeItemDisp />
          <br/>
          <br/>
        </div>
        <Footer/>
      </div>
    );
  }
}

export default HomePage;