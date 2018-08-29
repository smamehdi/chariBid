import React, { Component } from 'react'
import socketIO from 'socket.io-client';
import { Segment, Input, Button } from 'semantic-ui-react'

class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chatName: '',
            message: '',
            messages: []
        }
        this.room = this.props.itemId;
        this.socket = socketIO("http://159.203.57.3:5000");

        this.sendMessage = ev => {
            ev.preventDefault();
            if (this.props.org) {
                this.socket.emit('sendMessage', {
                    username: this.props.org[0].username,
                    message: this.state.message,
                    room: this.room
                })
            }
            if (this.props.buyer) {
                this.socket.emit('sendMessage', {
                    username: this.props.buyer.username,
                    message: this.state.message,
                    room: this.room
                })
            }
            
            this.setState({message: ''})
        }
        this.socket.on('receiveMessage', function(data){
            addMessage(data);
        })

        const addMessage = data => {
            console.log(data);
            //this.setState({messages: [ ...this.state.messages, data]});
            this.setState({messages: data})
            console.log(this.state.messages);
        };
    }
    componentDidMount() {
        if(this.props.org) {
            this.socket.emit('sendMessage', {
                username: this.props.org[0].username,
                message: '',
                room: this.room
            })
        } else if (this.props.buyer) {
            this.socket.emit('sendMessage', {
                username: this.props.buyer.username,
                message: '',
                room: this.room
            })
        }
    }
    render () {
        return (
            <div>
                
                <div >
                    <div >
                        <Segment inverted color='grey'>
                        {this.state.messages.map(msg => {
                            return (
                                <div> {msg.username} : {msg.message} </div>
                            )
                        })}
                        </Segment>
                    </div>
                    <div style={{align: 'center'}} >
                        <Input fluid
                            placeholder='message'
                            value={this.state.message}
                            onChange={ev => this.setState({message: ev.target.value})}
                        />
                        <Button
                            fluid
                            color='green'
                            content='Send'
                            onClick={this.sendMessage}
                        />
                    </div>
                </div>
                
            </div>
        )
    }
}

export default Chat;