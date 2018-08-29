import React, { Component } from 'react';
import { Segment, Header, Form, Grid, Icon, Image } from "semantic-ui-react";
import ConnectedOrgNavBar from './orgNavBar.js'
import Footer from './footer.js'
import { connect } from 'react-redux'

class OrgProfile extends Component {
    constructor() {
        super();
        this.state = {
            orgName: '',
            website: '',
            logo: '',
            email: '',
            username: '',
            country: '',
            postalCode: '',
            description: '',
            userType: 'org',
            orgId: ''
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    // on change of any field (found at semantic ui Form documentation)
    handleChange(evt, { name, value }) {
        if (name === 'logo') {
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
        delete state['confirmPassword'];
        fetch('/updateInfo', {
            method: 'POST',
            body: JSON.stringify(state)
        })
            .then(response => response.text())
            .then(responseBody => {
                let result = JSON.parse(responseBody)
                console.log(result);
                this.props.dispatch({
                    // change the store variable that will 
                    // render personalized page of org
                    type: 'showOrgPage',
                    content: this.props.orgId
                  })
            })
            .catch(err => {
                console.log(err)
                alert('there was an error, try again')
            })
    }
    componentDidMount(){
        this.setState({
            orgName: this.props.org[0].orgName,
            website: this.props.org[0].website,
            email: this.props.org[0].email,
            username: this.props.org[0].username,
            country: this.props.org[0].country,
            postalCode: this.props.org[0].postalCode,
            description: this.props.org[0].description,
            orgId: this.props.orgId
        })
    }
    render() {
        return (
            <div>
                <Segment inverted>
                <ConnectedOrgNavBar />
                <Header as='h1' style={{textAlign: 'center'}}>Edit Your Organization's Profile</Header>
                <Segment inverted>
                <Grid>
                    <Grid.Column>
                    </Grid.Column>
                    <Grid.Column width={3}>
                    <Segment color='blue'>
                    <Image wrapped size='medium' src={'/images/' + this.props.org[0].logo}/>
                    </Segment>
                    </Grid.Column>
                    
                    <Grid.Column width={12}>
                    <Segment inverted>
                    <Form centered inverted size='large' onSubmit={this.handleSubmit}>
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
                                <Grid.Column>
                                    <Form.Group widths='equal'>
                                        <Form.Input required
                                            name='username'
                                            label='Username:'
                                            placeholder='username'
                                            onChange={this.handleChange}
                                            value={this.state.username}
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
                    </Segment>
                    </Grid.Column>
                </Grid>
                </Segment>
                <Footer />
                </Segment>
            </div>
        );
    }

}
function mapStateToProps(state) {
    return {
        org: state.currentOrg,
        orgId : state.orgId
    }
    
}
export default connect(mapStateToProps)(OrgProfile);