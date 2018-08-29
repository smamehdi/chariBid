import React, {Component} from 'react'
import { Button } from 'semantic-ui-react'

class OrgBidOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
        <Button.Group>
            <Button>Add Time</Button>
            <Button>Cancel Auction</Button>
        </Button.Group>
        )
    }
}

export default OrgBidOptions