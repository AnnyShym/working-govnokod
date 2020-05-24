import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/cast.css';

class SeriesBlock extends Component {

    constructor(props) {

        super(props);

        this.state = {
            series: null,
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getSeries();
    }

    getSeries = () => {
        axios.get(`${serverAddress}cast/${this.props.cast}/${this.props.id}/series`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                series: response.data.rows,
                allowed: true,
                errors: []
            });
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
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })
    }

    onClickActors = () => {

        if (this.state.actors === null) {
            this.getActors();
        }

        this.setState({ 
            currentTab: "Actors" 
        });

    }

    render() {

        if (this.state.series === null) {
            return null;
        }

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        const tab = this.state.series.map((series, index) => 
            <div key={ index } className="cast-align d-flex justify-content-center">
                <Link to={ `/series/${series.series_id}` }>
                    <img src={ `${serverAddress}covers/x-small/${series.series_id}.jpg` } alt="Series" width="50px" height="50px" className="round" />
                </Link>
            </div>
        );

        return(

            <div className="d-flex flex-column">
                <div className="d-flex justify-content-center">
                    <div className="pb-2 px-2 underlined">
                        Series
                    </div>
                </div>
                <div className="mt-3 d-flex justify-content-center flex-wrap">
                    { tab }
                </div>
            </div>

        )

    }
    
}

export default SeriesBlock;
