import React, { Component } from 'react'
import { Form, Grid, Icon } from "semantic-ui-react";
import { connect } from 'react-redux'

class OrgSignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orgName: '',
      website: '',
      logo: '',
      banner: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      country: '',
      postalCode: '',
      description: '',
      userType: 'org'
    }
    
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  // on change of any field (found at semantic ui Form documentation)
  handleChange(evt, { name, value }) {
    if (name === 'logo' || name === 'banner') {
      this.setState({ logo: evt.target.files[0].name });
      return;
    }
    this.setState({ [name]: value })
  }

  handleSubmit() {
    if (this.state.password !== this.state.confirmPassword) {
      this.setState({ password: '', confirmPassword: '' });
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
      orgName: '',
      website: '',
      logo: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      country: '',
      postalCode: '',
      description: ''
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
              console.log(body)
              console.log(body.orgId)
              this.props.dispatch({
                // change the store variable that will 
                // render personalized page of org
                type: 'showOrgPage',
                content: body.orgId
              })
            })
            .catch(err => {
                console.log(err)
                alert('there was an error loging in, try again')
            })
      })
    
  }

  render() {
    return (
      <div>
          <br />
          
          <br />
          <Form centered onSubmit={this.handleSubmit} size='large'>
          <Grid>
            <Grid.Row centered columns={1}>
              <Grid.Column centered>
              <Form.Group unstackable widths='equal'>
                <Form.Input required
                  name='orgName'
                  label='Organization Name:'
                  placeholder='Organization'
                  onChange={this.handleChange}
                  value={this.state.orgName}
                />
                <Form.Input
                  name='website'
                  label='Website:'
                  placeholder='Url'
                  onChange={this.handleChange}
                  value={this.state.website}
                />
              </Form.Group>
              </Grid.Column>
          </Grid.Row>
          <Grid.Row centered columns={1}>
          <Grid.Column centered>
              <Form.Group widths='equal'>
                <Form.Input 
                  type='file'
                  name='logo'
                  label='Upload logo:'
                  onChange={this.handleChange}
                />

                <Form.Input required
                  name='email'
                  label='Contact Email:'
                  placeholder='Email'
                  onChange={this.handleChange}
                  value={this.state.email}
                  iconPosition='left' 
                >
                <Icon name='at' />
                <input />
                </Form.Input> 
              </Form.Group>
              </Grid.Column>
          </Grid.Row>
          <Grid.Row centered columns={1}>
            <Grid.Column centered>
              <Form.Group widths='equal'>
                <Form.Input 
                  type='file'
                  name='banner'
                  label='Upload banner:'
                  onChange={this.handleChange}
                />
              </Form.Group>
            </Grid.Column>
          </Grid.Row>
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
          <Grid.Column centered>
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
          </Grid.Row>
          <Grid.Row centered columns={1}>
          <Grid.Column centered>
              <Form.Group widths='equal'>
                <Form.TextArea
                  name='description'
                  label='Description:'
                  placeholder='Decription...'
                  onChange={this.handleChange}
                  value={this.state.description}
                />
              </Form.Group>
              
            </Grid.Column>
            <Form.Button  content='submit' />
          </Grid.Row>
              </Grid>
              
            </Form>
          
          <br />
      </div>
    );
  }
}

export default connect()(OrgSignUp);
