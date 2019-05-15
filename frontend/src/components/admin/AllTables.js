import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import Card from './Card';
import EmptyCard from './EmptyCard';

import serverAddress from '../../modules/server';
import statusCodes from '../../modules/status_codes';

import '../../styles/cards.css';

class AllTables extends Component {

    constructor(props) {

        super(props);

        this.state = {
            tables: ['administrators', 'users', 'series', 'seasons', 'episodes', 'actors', 'actorsinseries', 'ratings'],
            tablesAlt: ['Administrators', 'Users', 'Series', 'Seasons', 'Episodes', 'Actors', 'Actors In Series', 'Ratings'],
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.checkAccess();
    }

    checkAccess() {
        axios.get(`${serverAddress}tables`, {withCredentials: true})
        .then(response => {
            this.setState({
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
        })
    }

    render() {

        if (!this.state.allowed) {
            return <Redirect from='/' to='/signin' />
        }

        let i = 0;

        return(

            <div>
                <div className="row cards-row" >
                    <Card table={ this.state.tables[i] } tableAlt={ this.state.tablesAlt[i++] } />
                    <Card table={ this.state.tables[i] } tableAlt={ this.state.tablesAlt[i++] } />
                    <Card table={ this.state.tables[i] } tableAlt={ this.state.tablesAlt[i++] } />
                </div>
                <div className="row cards-row">
                    <Card table={ this.state.tables[i] } tableAlt={ this.state.tablesAlt[i++] } />
                    <Card table={ this.state.tables[i] } tableAlt={ this.state.tablesAlt[i++] } />
                    <Card table={ this.state.tables[i] } tableAlt={ this.state.tablesAlt[i++] } />
                </div>
                <div className="row cards-row">
                    <Card table={ this.state.tables[i] } tableAlt={ this.state.tablesAlt[i++] } />
                    <Card table={ this.state.tables[i] } tableAlt={ this.state.tablesAlt[i++] } />
                    <EmptyCard />
                </div>
            </div>

        );

    }

}

export default AllTables;
