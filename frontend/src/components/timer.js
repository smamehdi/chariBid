import React, { Component } from 'react';
import { Message, Header } from 'semantic-ui-react'

class Timer extends Component {
    constructor(props) {
        super(props);
        this.state = {timeRemaining:0, secondsRemaining : 0, minRemaining: 0,hourRemaining:0,dayRemaining:0}
        this.tick = this.tick.bind(this)
    }
    tick(time) {
        const timeRem = time -1000
        let min = this.formatMin(timeRem)
        let hr = this.formatHr(timeRem)
        let day = this.formatDays(timeRem)
        let sec = this.formatSec(timeRem)
        this.setState({
        timeRemaining:timeRem, 
        secondsRemaining: sec,
        minRemaining:min,
        hourRemaining:hr,
        dayRemaining:day});
        if (timeRem - 1000 <= 0) {
            clearInterval(this.interval);
        }
    }
    componentDidMount() {
        var startDate = new Date();
        var endDate = new Date(this.props.endDate);
        var timeDiff = endDate - startDate;

        this.setState({ timeRemaining: timeDiff }, ()=> {
          this.interval = setInterval(() => this.tick(this.state.timeRemaining), 1000);
        });
    }
    componentWillMount() {
        clearInterval(this.interval);
    }
    formatSec = (t) => {
        var seconds = Math.floor( (t/1000) % 60 );
        return seconds
    }
    formatMin = (t) => {
        var minutes = Math.floor( (t/1000/60) % 60 );
        return minutes
    }
    formatHr = (t) => {
        var hours = Math.floor( (t/(1000*60*60)) % 24 );
        return hours
    }
    formatDays = (t) => {
        var days = Math.floor( t/(1000*60*60*24) );
        return days
    }
    handleCloseItem = () => {
        fetch('/closeItem', {
            method: 'POST',
            mode: 'same-origin',
            credentials: 'include',
            body:JSON.stringify({'username': 'AmisDuJardin', 'itemId': this.props.item.itemId})
        })
          .then(response => response.text())
          .then(responseBody => {
              console.log(responseBody)
          })
    }
    render() {
        if (this.state.timeRemaining < 0 && this.props.item.state === 'TO_AUCTION') {
            this.handleCloseItem();
            return (
                <div>
                    <Message warning color="red">
                        <Message.Header>Unfortunately this auction is over.</Message.Header>
                    </Message>
                </div>
            )
        }else if(this.state.timeRemaining < 0 || this.props.item.state === 'AUCTIONED'){
            return (
                <div>
                    <Message warning color="red">
                        <Message.Header>Unfortunately this auction is over.</Message.Header>
                    </Message>
                </div>
            )
        } else {
            return (
                <div>
                  <Header sub>Time Left to Auction : </Header>
                  <span>
                    <b>{this.state.dayRemaining}</b>d <b>{this.state.hourRemaining}</b>hr <b>{this.state.minRemaining}</b>min <b>{this.state.secondsRemaining}</b>sec
                  </span>
                </div>
            )
        }
    }
}

export default Timer;
