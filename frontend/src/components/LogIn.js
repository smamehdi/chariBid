import React, { Component } from 'react'
import { Container, Form, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'


class LogIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange (evt, {name, value}) {
        this.setState({ [name]: value})
    }

    handleSubmit() {
        this.props.onSubmit()
        const state = Object.assign({}, this.state);
        fetch('/logIn', 
            {
                method:'POST',
                mode:'same-origin',
                credentials:'include',
                body: JSON.stringify(state)
            })
            .then(response => response.text())
            .then(res => {
                let body = JSON.parse(res);
                console.log(body)
                if(body.status && body.userType === 'org') {
                    console.log(body.orgId)
                    this.props.dispatch({
                        // change the store variable that will 
                        // render personalized page of org
                        type: 'showOrgPage',
                        content: body.orgId
                    
                    })
                }
                else if (body.status && body.userType === 'buyer') {
                    this.props.dispatch({
                        // change the store variable that will
                        // render personalized page of buyer
                        type: 'showBuyerPage',
                        content: body.user
                    })
                }
            })
            .catch(err => {
                console.log(err)
                alert('there was an error, try again')
            })
    }
    render() {
        return (
          <div>
            <br />
            <Header as='h1' style={{textAlign: 'center'}}> Log in</Header>
            <br />
            <Container textAlign='center'>
                <Form onSubmit={this.handleSubmit}>
                <Form.Group inline>
                    <Form.Input
                        name='username'
                        label='Userame:' 
                        placeholder='Organization'
                        onChange={this.handleChange}
                        value={this.state.username}  
                    />
                </Form.Group>
                <Form.Group inline>
                    <Form.Input
                        name='password'
                        label='Password:'
                        type='password'
                        placeholder='Password'
                        onChange={this.handleChange}
                        value={this.state.password}
                    />
                </Form.Group>
                <Form.Button content='submit'/>
                </Form>
            </Container>
            <br />
          </div>
        );
    }
}

let ConnectedLogIn = connect()(LogIn)

export default ConnectedLogIn;