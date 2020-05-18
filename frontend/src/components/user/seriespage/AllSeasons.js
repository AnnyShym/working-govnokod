import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import SeasonInfo from './SeasonInfo';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/info.css';

class AllSeasons extends Component {

    constructor(props) {

        super(props);

        this.state = {
            seasons: [],
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getSeasons();
    }

    getSeasons() {
        axios.get(`${serverAddress}series/${this.props.seriesId}/seasons`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                seasons: response.data.rows,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    seasons: [],
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    seasons: [],
                    errors: err.response.data.errors
                });
            }
        })
    }

    render() {
        if (this.state.seasons.length === 0 && this.state.errors.length === 0) {
            return <div></div>;
        }
        else {

            if (!this.state.allowed) {
                return <Redirect to="/signin" />
            }

            const errorBlocks = this.state.errors.map((error) =>
                <div key={ error.msg } className="container">
                    <div className="alert alert-danger">{ error.msg }</div>
                </div>
            );

            const seasonBlocks = this.state.seasons.map((season) =>
                <SeasonInfo key={ season.serial_number } season={ season } />
            );

            return(

                <div>
                    { this.state.errors.length === 0 ?
                        <div>
                           { seasonBlocks }
                        </div>
                    :
                        errorBlocks
                    }
                </div>

            );

        }
    }
}

export default AllSeasons;
