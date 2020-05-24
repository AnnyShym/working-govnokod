import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment'

import NavigationBar from '../NavigationBar';
import VideoWithKeyWords from './VideoWithKeyWords';
import CommentsBlock from '../comments/CommentsBlock';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/episode.css';

let redirect = null;

class Episode extends Component {

    constructor(props) {

        super(props);

        this.state = {
            episode: null,
            episodesCount: null,
            currentEpisode: null,
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getEpisodesCount();
        this.getEpisode(this.props.match.params.episodeNumber);
    }

    getEpisodesCount = () => {
        axios.get(`${serverAddress}series/${this.props.match.params.seriesId
            }/seasons/${this.props.match.params.seasonNumber}/count`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                episodesCount: response.data.totalCount[0].total_count,
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

    getEpisode = (currentEpisode) => {
        axios.get(`${serverAddress}series/${this.props.match.params.seriesId
            }/seasons/${this.props.match.params.seasonNumber}/episodes/${
            currentEpisode}`,
            {withCredentials: true})
        .then(response => {
            if (response.data.rows.length > 0) {
                this.setState({
                    episode: response.data.rows[0],
                    currentEpisode: currentEpisode,
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
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })
    }

    onClickNext = () => {
        if (this.props.match.params.episodeNumber < this.state.episodesCount) {

            redirect = <Redirect to={ `/series/${this.props.match.params.seriesId}/seasons/${
                this.props.match.params.seasonNumber}/episodes/${
                parseInt(this.props.match.params.episodeNumber) + 1}` } />

            this.setState({
                episode: null,
                allowed: true,
                errors: []
            });

            this.getEpisode(parseInt(this.state.currentEpisode) + 1);  

        }
    }

    onClickPrevious = () => {    
        if (this.props.match.params.episodeNumber > 1) {

            redirect = <Redirect to={ `/series/${this.props.match.params.seriesId}/seasons/${
                    this.props.match.params.seasonNumber}/episodes/${
                    parseInt(this.props.match.params.episodeNumber) - 1}` } />

            this.setState({
                episode: null,
                allowed: true,
                errors: []
            });

            this.getEpisode(parseInt(this.state.currentEpisode) - 1);  

        }
    }

    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        if (redirect) {
            const result = redirect;
            redirect = null;
            return result;
        }

        if (this.state.episode === null) {
            return null;
        }

        if (this.state.errors.length) {
            return(
                this.state.errors.map((error) =>
                    <div key={ error.msg } className="container">
                        <div className="alert alert-danger">{ error.msg }</div>
                    </div>
                )
            )
        }

        let title = '';
        if (this.state.episode.title) {
            title = ` "${ this.state.episode.title }"`;
        }

        let premiereDate = '';
        if (this.state.episode.premiere_date) {
            premiereDate = ` (${moment(this.state.episode.premiere_date).format("MMMM D, YYYY")})`;
        }

        let description = null;
        if (this.state.episode.description) {
            description = this.state.episode.description.split('\n');
        }
        
        return(

            <div>
                <NavigationBar />
                <div>
                    <div className="d-flex justify-content-between">
                        <Link to={ `/series/${this.props.match.params.seriesId}` } className="d-flex flex-column justify-content-end ml-4">
                            <img src={ require('../../../img/back.png') } alt="Back" height="50px" width="50px" />
                        </Link>
                        <div className="d-flex justify-content-center mt-5 title">
                            { `Episode ${ this.props.match.params.episodeNumber }${ title }${ premiereDate }` }
                        </div>
                        <div className="mr-5 icon-width">
                        </div>
                    </div>
                    <div className="d-flex flex-column">
                        <div className="d-flex justify-content-center">
                            <div onClick={ this.onClickPrevious } className="d-flex flex-column justify-content-center pointer">
                                <img src={ require('../../../img/episode_previous.png') } alt="Previous" height="50px" width="50px" />
                            </div>
                            <div className="video">
                                <VideoWithKeyWords episode_id={ this.state.episode.episode_id } />
                            </div>
                            <div onClick={ this.onClickNext } className="d-flex flex-column justify-content-center pointer">
                                <img src={ require('../../../img/episode_next.png') } alt="Next" height="50px" width="50px" />
                            </div>
                        </div>
                        <div className="d-flex justify-content-center">                        
                            { description ?  
                                <div className="w-75 p-5 mb-3 shadow description">  
                                {             
                                    description.map((str, index) =>
                                        (index === description.length) ?
                                            <p key={ index }>{ str }</p>
                                        :
                                            <p key={ index } className="mb-0">{ str }</p>
                                    )
                                }
                                </div>
                            :
                                ""
                            }
                        </div>
                    </div>
                </div>
                <CommentsBlock about="episodes" id={ this.state.episode.episode_id } />
            </div>

        )

    }

}

export default Episode;
