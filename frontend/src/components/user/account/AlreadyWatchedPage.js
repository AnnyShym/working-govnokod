import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import SeriesCard from '../allseries/SeriesCard';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/account.css';

const SERIES_PER_PAGE = 2;

class AlreadyWatchedPage extends Component {

    constructor(props) {

        super(props);

        this.state = {
            currentPage: 0,
            watched: null,
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getAlreadyWatched('next');
    }

    getAlreadyWatched = (operation) => {

        if ((this.state.currentPage === 0) && 
            (operation === "previous")) {
            return;
        }

        let currentPage = this.state.currentPage;
        if (this.state.watched !== null) {
            if (operation === "next") {
                currentPage += 1;
            }
            else {
                currentPage -= 1;
            }
        }

        axios.get(`${serverAddress}already-watched/${currentPage}/${SERIES_PER_PAGE}`,
            {withCredentials: true})
        .then(response => {     
            if (response.data.rows.length > 0) {     
                this.setState({
                    watched: response.data.rows,
                    currentPage: currentPage,
                    allowed: true,
                    errors: []
                })
            }
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

        if ((this.state.watched === null) ||
            (this.state.watched.length === 0)) {
            return null;
        }

        return(

            <div className="h-100 mx-5 d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-between">
                    <div className="d-flex flex-column justify-content-center pagination-btn">
                        <img src={ require('../../../img/previous.png') } onClick={ () => this.getAlreadyWatched("previous") } alt="Previous" height="15%" className="pointer" />
                    </div>
                    { 
                        this.state.watched.map((series) => {
                            return(           
                                <div key={ series.series_id } className="series-card account-shadow">                 
                                    <SeriesCard series={ series } />
                                </div>
                            )
                        })
                    }
                    <div className="d-flex flex-column justify-content-center pagination-btn">
                        <img src={ require('../../../img/next.png') } onClick={ () => this.getAlreadyWatched("next") } alt="Next" height="15%" className="pointer" />
                    </div>
                </div>
            </div>

        );

    }

}

export default AlreadyWatchedPage;
