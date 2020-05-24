import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import NavigationBar from '../NavigationBar';
import CastInfo from './CastInfo';
import CommentsBlock from '../comments/CommentsBlock';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

class CastPage extends Component {

    constructor(props) {

        super(props);

        this.state = {
            cast: null,
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        if ((this.props.match.params.cast === "actors") ||
            (this.props.match.params.cast === "creators") ||
            (this.props.match.params.cast === "producers")) {
            this.getCastInfo();
        }        
    }

    getCastInfo() {
        axios.get(`${serverAddress}cast/${this.props.match.params.cast}/${this.props.match.params.id}`,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                cast: response.data.rows,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            else {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })
    }

    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }       

        if (this.state.cast === null || this.state.cast.length === 0) {
            return null;
        }

        const errorBlocks = this.state.errors.map((error) =>
            <div key={ error.msg } className="container">
                <div className="alert alert-danger">{ error.msg }</div>
            </div>
        );

        return(

            <div>
                { (this.state.errors.length > 0) ?
                    <div className="d-flex flex-column">
                        { errorBlocks }
                    </div>
                :
                    <div>
                        <div>
                            <NavigationBar />
                            <CastInfo castInfo={ this.state.cast[0] } cast={ this.props.match.params.cast } id={ this.props.match.params.id } />
                            <CommentsBlock about={ this.props.match.params.cast } id={ this.props.match.params.id } />
                        </div>
                    </div>
                }
            </div>

        );

    }

}

export default CastPage;
