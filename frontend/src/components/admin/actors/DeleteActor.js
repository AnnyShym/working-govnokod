import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

class DeleteActor extends Component {

    constructor(props) {

        super(props);

        this.state = {
            table: 'actors',
            route: 'http://localhost:8080/',
            authorized: true,
            deleted: false,
            errors: []
        }

        this.statusCodes = {
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            INTERNAL_SERVER_ERROR: 500
        };

    }

    componentDidMount() {
        this.deleteActor(this.props.match.params.id);
    }

    deleteActor(actorId) {
        axios.post(`${this.state.route}${this.state.table}/delete/${actorId}`,
            {}, {withCredentials: true})
        .then(response => {
            this.setState({
                authorized: true,
                deleted: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                this.statusCodes.UNAUTHORIZED) {
                this.setState({
                    authorized: false,
                    deleted: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && (err.response.status ===
                this.statusCodes.INTERNAL_SERVER_ERROR ||
                err.response.status === this.statusCodes.BAD_REQUEST)) {
                this.setState({
                    deleted: false,
                    errors: err.response.data.errors
                });
            }
        })
    }

    render() {
        if (!this.state.authorized) {
            return <Redirect from={ `/${this.state.table}/delete/${
                this.props.match.params.id}` } to='/signin' />
        }
        else {
            if (this.state.deleted) {
                return <Redirect from={ `/${this.state.table}/delete/${
                    this.props.match.params.id}` } to={ `/${this.state.table}` } />
            }
            else {
                let errorBlocks = this.state.errors.map((error) =>
                    <div key={ error.msg } className="container">
                        <div className="alert alert-danger">{ error.msg }</div>
                    </div>
                );
                return(

                    <div>
                        { errorBlocks }
                    </div>

                )
            }
        }
    }
}

export default DeleteActor;
