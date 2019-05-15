import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import TableRow from './TableRow';

class Table extends Component {
    render() {
        return(

            <div>
                <div>
                    { this.props.errorBlocks }
                </div>
                <div>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                { Array.prototype.map.call(this.props.columns, function (column, index) {
                                    return <th key={ column } scope="col">{ column }</th>
                                }, this)}
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            { Array.prototype.map.call(this.props.rows, function (row, index) {
                                return <TableRow key={ row.id } table={ this.props.table } row={ row } getRowInfo={ this.props.getRowInfo }/>
                            }, this)}
                        </tbody>
                    </table>
                    <div align="center">
                        <Link to={ `/${this.props.table}/insert` } rel="noopener" className="btn btn-sm btn-success">Insert</Link>
                    </div>
                </div>
            </div>

        )
    }
}

export default Table;
