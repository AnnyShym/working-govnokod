import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import SeasonInfo from './SeasonInfo';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

class AllSeasons extends Component {

    constructor(props) {

        super(props);

        this.state = {
            seasons: null,
            currentSeason: null,
            episodes: null,
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

    getEpisodes = (seasonId, index) => {
        axios.get(`${serverAddress}season/${seasonId}/episodes`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                episodes: response.data.rows,
                currentSeason: index,
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
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
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

        if (!this.state.seasons) {
            return null;
        }

        const errorBlocks = this.state.errors.map((error) =>
            <div key={ error.msg } className="container">
                <div className="alert alert-danger">{ error.msg }</div>
            </div>
        );

        return(

            <div className="bg-white">
                { (this.state.errors.length > 0) ?
                    errorBlocks
                :
                    <div>
                        <div className="d-flex justify-content-around">
                        {
                            this.state.seasons.map((season, index) =>
                                <div onClick={ () => this.getEpisodes(season.season_id, index) } key={ index } className="font-weight-bold pointer p-3 underlined">
                                    Season { season.serial_number }
                                </div>
                            )
                        }                  
                        </div>
                        { (this.state.currentSeason !== null) ?
                            <SeasonInfo seriesId={ this.props.seriesId } season={ this.state.seasons[this.state.currentSeason] } episodes={ this.state.episodes } />
                        :
                            <div></div>
                        }
                    </div>
                }
            </div>

        );

    }

}

export default AllSeasons;
