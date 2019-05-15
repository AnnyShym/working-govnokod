import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';

import Table from '../Table';

class Actors extends Component {

    constructor(props) {

        super(props);

        this.state = {
            table: 'actors',
            route: 'http://localhost:8080/',
            columns: ['#', 'Name', 'Middle Name', 'Last Name', 'Citizenship'],
            rows: [],
            authorized: true,
            errors: []
        };

        this.statusCodes = {
            UNAUTHORIZED: 401,
            INTERNAL_SERVER_ERROR: 500
        };

    }

    componentDidMount() {
        this.getActors();
    }

    getActors() {
        axios.get(`${this.state.route}${this.state.table}`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                rows: response.data.rows,
                authorized: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                this.statusCodes.UNAUTHORIZED) {
                this.setState({
                    rows: [],
                    authorized: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                this.statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    rows: [],
                    errors: err.response.data.errors
                });
            }
        })
    }

    getActorInfo(table, row) {
        return(

            <tr>
                <th scope="row">{ row.id }</th>
                <td>{ row.name }</td>
                <td>{ row.middle_name }</td>
                <td>{ row.last_name }</td>
                <td>{ row.citizenship }</td>
                <td>
                    <div className="btn-group-vertical">
                        <Link to={ `/${table}/update/${row.id}` } rel="noopener" className="btn btn-sm btn-success">Update</Link>
                        <Link to={ `/${table}/delete/${row.id}` } rel="noopener" className="btn btn-sm btn-danger">Delete</Link>
                    </div>
                </td>
            </tr>

        )
    }

    render() {

        let errorBlocks = null;
        if (!this.state.authorized) {
            return <Redirect from={ `/${this.state.table}` } to='/signin' />
        }
        else {
            errorBlocks = this.state.errors.map((error) =>
                <div key={ error.msg } className="container">
                    <div className="alert alert-danger">{ error.msg }</div>
                </div>
            );
        }

        return(

            <Table table={ this.state.table } columns={ this.state.columns } rows={ this.state.rows } getRowInfo={ this.getActorInfo } errorBlocks={ errorBlocks } />

        )

    }

}

export default Actors;
