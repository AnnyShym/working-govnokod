import { Component } from 'react';

class TableRow extends Component {
    render() {
        return(

            this.props.getRowInfo(this.props.table, this.props.row)

        )
    }
}

export default TableRow;
