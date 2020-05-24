import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import NavigationBar from '../NavigationBar';
import SearchSeries from '../SearchSeries';
import SeriesCard from './SeriesCard';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/series_info.css';

const SERIES_PER_PAGE = 5;

class AllSeries extends Component {

    constructor(props) {

        super(props);

        this.state = {
            currentPage: 0,
            series: null,
            criteria: null,
            allowed: true,
            errors: []
        };

    }

    loadSeries = (operation) => {

        let currentPage = this.state.currentPage;

        if ((currentPage === 0) && 
            (operation === "previous")) {
            return;
        }        

        if (this.state.series !== null) {
            currentPage = (operation === "next") ? (currentPage + 1) : (currentPage - 1);
        }

        axios.get(`${serverAddress}series/${this.state.criteria.title}/${this.state.criteria.englishLevel}/${
            this.state.criteria.country}/${this.state.criteria.ageLimit}/${
            this.state.criteria.tags}/${this.state.criteria.genres}/${this.state.criteria.actors}/${
            this.state.criteria.creators}/${this.state.criteria.producers}/${this.state.criteria.filter.column}/${
            this.state.criteria.filter.direction}/${currentPage}/${SERIES_PER_PAGE}`,
            {withCredentials: true})        
        .then(response => {
            if (response.data.rows.length > 0) {
                this.setState({
                    series: response.data.rows,
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
                    series: null,
                    currentPage: 0,
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            else {
                this.setState({
                    series: null,
                    currentPage: 0,
                    errors: err.response.data.errors
                });
            }
        })

    }

    handeFormRequest = (criteria) => {

        this.setState({
            series: null,
            currentPage: 0,
            criteria: criteria
        });        

        setTimeout(() => this.loadSeries("next"));

    }

    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        let errorBlocks = this.state.errors.map((error) =>
            <div key={ error.msg } className="container">
                <div className="alert alert-danger">{ error.msg }</div>
            </div>
        );

        return(

            <div className="h-100">
                <NavigationBar />
                { (this.state.errors.length > 0) ?
                    <div className="all-series">
                        { errorBlocks }
                    </div>
                :
                    <div className="all-series">
                        <div className="d-flex flex-column container all-series-container">
                            <SearchSeries criteria={ this.props.match.params.criteria } name={ this.props.match.params.name } onFormRequest={ this.handeFormRequest } />
                            { (this.state.series === null) ?
                                <div className="mb-3">
                                    <div className="d-flex justify-content-center">
                                        Sorry, no series matched the criteria.
                                    </div>    
                                </div>
                            :
                                <div className="p-relative">
                                    <div className="container series-block">
                                        {
                                            this.state.series.map((series) =>
                                                <SeriesCard key={ series.series_id } series={ series } />
                                            )
                                        }
                                    </div>
                                    <div className="d-flex justify-content-between p-3">
                                        <button onClick={ () => this.loadSeries("previous") } className="btn btn-dark">Previous</button>
                                        <button onClick={ () => this.loadSeries("next") } className="btn btn-dark">Next</button>
                                    </div>
                                </div>
                            }   
                        </div>
                    </div>
                }
            </div>

        );

    }

}

export default AllSeries;
