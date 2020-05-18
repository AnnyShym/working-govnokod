import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import SeriesCard from '../allseries/SeriesCard';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/account.css';

const SERIES_PER_PAGE = 2;

class FavouritesPage extends Component {

    constructor(props) {

        super(props);

        this.state = {
            currentPage: 0,
            favourites: null,
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getFavourites('next');
    }

    getFavourites = (operation) => {

        if ((this.state.currentPage === 0) && 
            (operation === "previous")) {
            return;
        }

        let currentPage = this.state.currentPage;
        if (this.state.favourites !== null) {
            if (operation === "next") {
                currentPage += 1;
            }
            else {
                currentPage -= 1;
            }
        }

        axios.get(`${serverAddress}favourites/${currentPage}/${SERIES_PER_PAGE}`,
            {withCredentials: true})
        .then(response => {     
            if (response.data.rows.length > 0) {     
                this.setState({
                    favourites: response.data.rows,
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

        if ((this.state.favourites === null) ||
            (this.state.favourites.length === 0)) {
            return null;
        }

        return(

            <div className="h-100 mx-5 d-flex flex-column justify-content-center">
                <div className="d-flex justify-content-between">
                    <div className="d-flex flex-column justify-content-center pagination-btn">
                        <img src={ require('../../../img/previous.png') } onClick={ () => this.getFavourites("previous") } alt="Previous" height="15%" className="pointer" />
                    </div>
                    { 
                        this.state.favourites.map((favourite) => {
                            return(           
                                <div key={ favourite.series_id } className="series-card account-shadow">                 
                                    <SeriesCard series={ favourite } />
                                </div>
                            )
                        })
                    }
                    <div className="d-flex flex-column justify-content-center pagination-btn">
                        <img src={ require('../../../img/next.png') } onClick={ () => this.getFavourites("next") } alt="Next" height="15%" className="pointer" />
                    </div>
                </div>
            </div>

        );

    }

}

export default FavouritesPage;
