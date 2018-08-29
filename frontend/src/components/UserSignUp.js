import React, { Component } from 'react'
import { Form, Grid } from "semantic-ui-react";
import { connect } from 'react-redux'

class UserSignUp extends Component {
    constructor (props) {
        super(props);
        this.state = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            country: '',
            postalCode: '',
            userType: 'buyer'
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    // on change of any field (found at semantic ui Form documentation)
    handleChange (evt, {name, value}) {
        this.setState({ [name]: value })
    }

    handleSubmit () {
      if (this.state.password !== this.state.confirmPassword) {
          this.setState({password: '', confirmPassword: ''});
          alert(`passwords do not match`);
          return;
      }
      const state = Object.assign({}, this.state);
      let signUpState = this.state
      delete state['confirmPassword'];
      fetch('/signUp', {
        method: 'POST',
        body: JSON.stringify(state)
      })
        .then(response => response.text())
        .then(responseBody => {
          let result = JSON.parse(responseBody)
          console.log(result);
        })
        .catch(err => {
          console.log(err)
          alert('there was an error, try again')
        })
        .then(() => {
          // set The state back to empty
      this.setState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        country: '',
        postalCode: '',
        userType: 'buyer'
      });
      fetch('/logIn', 
              {
                  method:'POST',
                  mode:'same-origin',
                  credentials:'include',
                  body: JSON.stringify({username: signUpState.username, password: signUpState.password})
              })
              .then(response => response.text())
              .then(res => {
                let body = JSON.parse(res);
                this.props.dispatch({
                  // change the store variable that will 
                  // render personalized page of org
                  type: 'showBuyerPage',
                  content: body.user
                })
              })
              .catch(err => {
                  console.log(err)
                  alert('there was an error loging in, try again')
              })
        })
      // set The state back to empty
      /*this.setState({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          country: '',
          postalCode: '',
      })*/
    }

    render() {
        return (
          <div>
            <Form centered onSubmit={this.handleSubmit} size='large'> 
              <Grid>
                <Grid.Row centered columns={1}>
                
                <Grid.Column>
                <Form.Group widths='equal'>
                  <Form.Input required
                    name='username'
                    label='Username:'
                    placeholder='username'
                    onChange={this.handleChange}
                    value={this.state.username}
                  />

                  <Form.Input required
                    name='email'
                    label='Contact Email:'
                    placeholder='Email'
                    onChange={this.handleChange}
                    value={this.state.email}
                  />
                </Form.Group>
                </Grid.Column>
                </Grid.Row>
                <Grid.Row centered columns={1}>
                <Grid.Column>
                <Form.Group widths='equal'>
                  <Form.Input required
                    type='password'
                    name='password'
                    label='Password:'
                    placeholder='password'
                    onChange={this.handleChange}
                    value={this.state.password}
                  />

                  <Form.Input required
                    type='password'
                    name='confirmPassword'
                    label='Confirm Password:'
                    placeholder='Confirm password'
                    onChange={this.handleChange}
                    value={this.state.confirmPassword}
                  />
                </Form.Group>
                </Grid.Column>
                </Grid.Row>
                <Grid.Row centered columns={1}>
                
                <Grid.Column>
                <Form.Group widths='equal'>
                  <Form.Input required
                    name='firstName'
                    label='First name:'
                    placeholder='first name'
                    onChange={this.handleChange}
                    value={this.state.fisrstName}
                  />

                  <Form.Input required
                    name='lastName'
                    label='Last name:'
                    placeholder='last name'
                    onChange={this.handleChange}
                    value={this.state.lastName}
                  />
                </Form.Group>
                </Grid.Column>
                </Grid.Row>
                <Grid.Row centered columns={1}>
                
                <Grid.Column>
                <Form.Group widths='equal'>
                  <Form.Input required
                    name='country'
                    label='Country:'
                    placeholder='Country'
                    onChange={this.handleChange}
                    value={this.state.country}
                  />

                  <Form.Input required
                    name='postalCode'
                    label='Postal Code:'
                    placeholder='Postal Code'
                    onChange={this.handleChange}
                    value={this.state.postalCode}
                  />
                </Form.Group>
                </Grid.Column>
                <Form.Button content='submit' />
                </Grid.Row>
                </Grid>
              </Form>
            <br />
            <br />
          </div>
        );
    }
}

export default connect()(UserSignUp);