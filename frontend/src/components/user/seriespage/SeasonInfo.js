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
            title: '',
            premiereDate: '',
            episodes: [],
            expanded: false,
            allowed: true,
            errors: []
        };

        this.onExpand = this.onExpand.bind(this);

    }

    componentWillMount() {

        let title = '';
        if (this.props.season.title !== null && this.props.season.title !== '') {
            title = ` "${ this.props.season.title }"`;
        }

        let premiereDate = '';
        if (this.props.season.premiere_date !== null) {
            premiereDate = ` (${ getDate(this.props.season.premiere_date) })`;
        }

        this.setState({
            title: title,
            premiereDate: premiereDate
        });

    }

    onExpand() {

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

        let description = null;
        let episodeBlocks = <div></div>;
        let errorBlocks = <div></div>;
        if (this.state.expanded) {

            if (this.props.season.description !== null &&
                this.props.season.description !== '') {
                description = <p>Description: { this.props.season.description }</p>
            }

            if (this.state.errors.length === 0) {
                episodeBlocks = this.state.episodes.map((episode) =>
                    <EpisodeInfo key={ episode.serial_number } episode={ episode } />
                );
            }
            else {
                errorBlocks = this.state.errors.map((error) =>
                    <div key={ error.msg } className="container">
                        <div className="alert alert-danger">{ error.msg }</div>
                    </div>
                );
            }

        }

        return(

            <div className="card">
                <div className="card-body">
                    <div onClick={ this.onExpand } className="title">Season { this.props.season.serial_number }{ this.state.title }{ this.state.premiereDate }</div>
                    { this.state.expanded ?
                        this.state.errors.length === 0 ?
                            <div>
                                { description }
                                <div className="card info-card">
                                    <div className="card-body info-card-body">
                                        { episodeBlocks }
                                    </div>
                                </div>
                            </div>
                        :
                        <div>
                            { description }
                            <div className="card info-card">
                                <div className="card-body info-card-body">
                                    { errorBlocks }
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
