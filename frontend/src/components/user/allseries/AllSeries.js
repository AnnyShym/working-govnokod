import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import NavigationBar from '../NavigationBar';
import SeriesBlock from './SeriesBlock';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/series_info.css';

const SERIES_PER_PAGE = 5;

class AllSeries extends Component {

    constructor(props) {

        super(props);
        this.state = {
            previousIndex: 0,
            series: [],
            allowed: true,
            errors: []
        };

        this.LoadPrevious = this.LoadPrevious.bind(this);
        this.LoadNext = this.LoadNext.bind(this);

    }

    componentDidMount() {
        this.loadSeries('next');
    }

    loadSeries(operation) {
        axios.get(`${serverAddress}series/${operation}/${this.state.previousIndex}/${SERIES_PER_PAGE}`, {withCredentials: true})
        .then(response => {
            if (response.data.rows.length > 0) {
                this.setState({
                    series: response.data.rows,
                    previousIndex: response.data.rows[response.data.rows.length - 1].series_id,
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
                    series: [],
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    series: [],
                    errors: err.response.data.errors
                });
            }
        })
    }

    LoadPrevious(e) {
        this.loadSeries('previous');
    }

    LoadNext(e) {
        this.loadSeries('next');
    }

    render() {

        let errorBlocks = null;
        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }
        else {
            errorBlocks = this.state.errors.map((error) =>
                <div key={ error.msg } className="container">
                    <div className="alert alert-danger">{ error.msg }</div>
                </div>
            );
        }

        return(

            <div className="all-series">
                <div>
                    <NavigationBar />
                    { errorBlocks }
                    { (this.state.errors.length > 0) ?
                        <div></div>
                    :
                        <div>
                            <div>
                                <SeriesBlock series={ this.state.series }/>
                            </div>
                            
                        </div>
                    }
                    <div onClick={ this.LoadPrevious } className="pagination pagination-left">Previous</div>
                    <div onClick={ this.LoadNext } className="pagination pagination-right">Next</div>
                </div>
            </div>

        );
    }
}

export default AllSeries;
