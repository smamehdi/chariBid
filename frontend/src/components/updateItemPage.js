import React, { Component} from 'react'
import {Container, Form, Input, Label, Button, Dropdown} from 'semantic-ui-react'
import { connect } from 'react-redux'
import OrgNavBar from './orgNavBar.js'
import Footer from './footer.js'

class UpdateItemPage extends Component {
    constructor() {
        super();
        this.state = {
            title: '',
            username: '',
            description: '',
            category: '',
            images: '',
            initialPrice: '',
            bidStartDate: '',
            bidFinDate: '',
            bidPeriod: '',
            bidTypePeriod: '',
                       
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.showEndTime = this.showEndTime.bind(this)
        this.handleDateChange = this.handleDateChange.bind(this)
    }

    showEndTime(bidTypePeriod){
        // split the date in calendar and hours
        let dateArr = this.state.bidStartDate.split('T')
        // if the user wants to use hours
        if(bidTypePeriod === 'hours'){
            let timeArr = dateArr[1].split(':');
            let hour = parseInt(timeArr[0]);
            hour = hour + parseInt(this.state.bidPeriod);
            // if the hours added are over 24
            // we need to add one to days
            if(hour >= 24) {
                hour -= 24
                let calendarArr = dateArr[0].split('-')
                let day = parseInt(calendarArr[2])
                day = day + 1;
                calendarArr[2] = day + ''
                timeArr[0] = hour + ''
                dateArr[0] = calendarArr.join('-')
                dateArr[1] = timeArr.join(':')
                console.log(dateArr.join('T'))
                return dateArr.join('T')
            } else {
                timeArr[0] = hour + ''
                dateArr[1] = timeArr.join(':')
                console.log(dateArr.join('T'))
                return dateArr.join('T')
            }
        }
        // if the user wants to add days
        if(bidTypePeriod === 'days'){
            let calendarArr = dateArr[0].split('-');
            let day = parseInt(calendarArr[2]);
            day = day + parseInt(this.state.bidPeriod);
            if(day > 31) {
                day = day - 31;
                let month = parseInt(calendarArr[1]);
                month = month + 1;
                calendarArr[1] = month + '';
                calendarArr[2] = day + '';
                dateArr[0] = calendarArr.join('-');
                console.log(dateArr.join('T'))
                return dateArr.join('T')
            } else {
                calendarArr[2] = day + '';
                dateArr[0] = calendarArr.join('-');
                console.log(dateArr.join('T'))
                return dateArr.join('T')
            }
        }
    }
    handleChange (evt, {name, value}) {
        if( name === 'images') {
            this.setState({[name]: evt.target.files[0].name})
            return;
        }
        if( name === 'bidTypePeriod' && this.state.bidPeriod !== ''){
            this.setState({bidFinDate: this.showEndTime(evt.target.outerText)})
        }
        this.setState({ [name]: value })
    }

    handleDateChange (evt) {
        this.setState({ bidStartDate: evt.target.value})
    }

    handleSubmit () {
        let state = Object.assign({}, this.state)
        state['orgId'] = this.props.orgId;
        state['username'] = this.props.org[0].username;
        fetch('/updateItem', {
            method: 'PUT',
            mode: 'same-origin',
            credentials: 'include',
            body: JSON.stringify(state)
          })
            .then(response => response.text())
            .then(responseBody => {
              let result = JSON.parse(responseBody)
              console.log(result)
            })
            .catch(err => {
              console.log(err)
              alert('there was an error, try again')
            })
        this.props.dispatch({
            type: 'showOrgPage',
            content: this.props.orgId
        })
    }

    componentDidMount () {
        this.setState({
            title: this.props.item.title,
            username: this.props.item.username,
            description: this.props.item.description,
            category: this.props.item.category,
            images: this.props.item.images,
            initialPrice: this.props.item.initialPrice,
            bidStartDate: this.props.item.bidStartDate,
            bidFinDate: this.props.item.bidFinDate,
            bidPeriod: this.props.item.bidPeriod,
            bidTypePeriod: this.props.item.bidTypePeriod,
        })
    }

    render() {
        const options = [
            {key: 'hours', text: 'hours', value: 'hours'},
            {key: 'days', text: 'days', value: 'days'}
        ];
        const optionC = [
            { key: 1, text: 'Electronics', value: 'Electronics' },
            { key: 2, text: 'Furniture', value: 'Furniture'},
            { key: 3, text: 'Clothing', value: 'Clothing' },
            { key: 4, text: 'Handmade', value: 'Handmade'},
            { key: 5, text: 'Sport', value: 'Sport'},
            { key: 6, text: 'Other', value: 'Other'}
        ]
        return (
        <div>
          <OrgNavBar />
          <br/>
          <br/>
          <br/>
          <Container textAlign='center'>
            <Form onSubmit={this.handleSubmit}>
                <h2>EDIT ITEM</h2>
                <Form.Field inline>
                    <label>Name(title):</label>
                    <Input
                        defaultValue={this.state.title}
                        name='title'
                        onChange={this.handleChange}
                        required
                     />
                </Form.Field>
                <Form.Field>
                    <label>Description:</label>
                    <Form.TextArea
                        margin-left='20px'
                        value={this.state.description}
                        name='description'
                        onChange={this.handleChange}
                        required
                    />
                </Form.Field>
                <Form.Field inline>
                    <label>Category:</label>
                    <Dropdown
                        name='category'
                        simple
                        text={this.state.category}
                        options={optionC}
                        onChange={this.handleChange}
                    />
                </Form.Field>
                <Form.Field inline>
                    <label>Picture of Item:</label>
                    <Form.Input
                        type='file'
                        name='images'
                        onChange={this.handleChange}
                        required
                    />
                </Form.Field>
                <Form.Field inline>
                    <label>Initial Price:</label>
                        <Label as='a' basic>$</Label>
                        <Input 
                            type='number' 
                            name='initialPrice'
                            defaultValue={this.state.initialPrice}
                            onChange={this.handleChange}
                            required
                        />
                </Form.Field>
                <Form.Field inline>
                    <label>Start bid at:</label>
                    <input 
                        type='datetime-local' 
                        min='2018-08-15T14:00'
                        name='bidStartDate'
                        defaultValue={this.state.bidStartDate}
                        onChange={this.handleDateChange}
                        value={this.state.bidStartDate} 
                        required
                    />
                </Form.Field>
                <Form.Field inline>
                    <label>Time of Bid:</label>
                    <Input
                        name='bidPeriod'
                        action={<Dropdown name='bidTypePeriod'
                            button basic floating 
                            options={options} 
                            text={this.state.bidTypePeriod}
                            onChange={this.handleChange}
                            />
                        }
                        type='number'
                        defaultValue={this.state.bidPeriod}

                        onChange={this.handleChange}
                    />
                </Form.Field>
                <Form.Field inline>
                    <label>End bid at:</label>
                    <input
                        type='datetime-local'
                        value={this.state.bidFinDate}
                        required
                    />
                </Form.Field>
                <Button type='submit'>UPDATE</Button>
            </Form>
          </Container>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <Footer />
        </div>
        );
    }
}
function mapStatetoParams(state) {
    return {
        orgId: state.orgId,
        org: state.currentOrg,
        item: state.item
    }
}


export default connect(mapStatetoParams)(UpdateItemPage);