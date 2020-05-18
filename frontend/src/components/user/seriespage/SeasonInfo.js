import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import EpisodeInfo from './EpisodeInfo';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';
import getDate from '../../../modules/get_date';

import '../../../styles/info.css';

class SeasonInfo extends Component {

    constructor(props) {

        super(props);

        this.state = {
            episodes: [],
            expanded: false,
            allowed: true,
            errors: []
        };

    }

    onExpand = () => {

        if (!this.state.expanded && this.state.episodes.length === 0) {
            this.getEpisodes();
            return;
        }

        this.setState({
            expanded: !this.state.expanded
        });

    }

    getEpisodes() {
        axios.get(`${serverAddress}season/${this.props.season.season_id}/episodes`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                episodes: response.data.rows,
                expanded: true,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    episodes: [],
                    expanded: true,
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    episodes: [],
                    expanded: true,
                    errors: err.response.data.errors
                });
            }
        })
    }

    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        let title = '';
        if (this.props.season.title !== null && this.props.season.title !== '') {
            title = ` "${ this.props.season.title }"`;
        }

        let premiereDate = '';
        if (this.props.season.premiere_date !== null) {
            premiereDate = ` (${ getDate(this.props.season.premiere_date) })`;
        }

        let description = null;
        let episodeBlocks = null;
        let errorBlocks = <div></div>;
        if (this.state.expanded) {

            if (this.props.season.description !== null &&
                this.props.season.description !== '') {
                description = <p className="w-75 mb-0">
                    Description:
                    <br />
                    { this.props.season.description }
                    </p>
            }

            if (this.state.errors.length > 0) {
                errorBlocks = this.state.errors.map((error) =>
                    <div key={ error.msg } className="container">
                        <div className="alert alert-danger">{ error.msg }</div>
                    </div>
                );
            }

            if (this.state.episodes.length > 0) {
                episodeBlocks = this.state.episodes.map((episode) =>
                    <EpisodeInfo key={ episode.episode_id } episode={ episode } />
                );
            }

        }

        return(

            <div className="card border-btm">
                <div className="card-body">
                    <div onClick={ this.onExpand } className="title">Season { this.props.season.serial_number }{ title }{ premiereDate }</div>
                    { this.state.expanded ?
                        this.state.errors.length === 0 ?
                            <div className="d-flex flex-column justify-content-between">
                                <div className="mt-5 mb-4 d-flex justify-content-center">
                                    { description }
                                </div>
                                <div className="mb-5 mt-4 card info-card">
                                    <div className="d-flex flex-column ml-5">
                                        { episodeBlocks }
                                    </div>
                                </div>
                            </div>
                        :
                        <div>
                            <div className="d-flex flex-column justify-content-between">
                                <div className="mt-4 mb-2 d-flex justify-content-center">
                                    { description }
                                </div>
                                <div className="mt-2 mb-4 d-flex justify-content-center card info-card">
                                    <div className="card-body">
                                        { errorBlocks }
                                    </div>
                                </div>
                            </div>
                        </div>
                    :
                        <div></div>
                    }
                </div>
            </div>

        )

    }
    
}

export default SeasonInfo;
