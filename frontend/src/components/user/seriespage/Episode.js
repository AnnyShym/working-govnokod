import React, { Component } from 'react';

import NavigationBar from '../NavigationBar';
import VideoWithKeyWords from './VideoWithKeyWords';

import getDate from '../../../modules/get_date';

import '../../../styles/info.css';

class Episode extends Component {

    render() {

        let title = '';
        if (this.props.episode.title !== null && this.props.episode.title !== '') {
            title = ` "${ this.props.episode.title }"`;
        }

        let premiereDate = '';
        if (this.props.episode.premiere_date !== null) {
            premiereDate = ` (${ getDate(this.props.episode.premiere_date) })`;
        }

        let description = null;
        if (this.props.episode.description !== null &&
            this.props.episode.description !== '') {
            description = 
                <p className="pt-5 mt-2 w-75">
                    Description:
                    <br />
                    { this.props.episode.description }
                </p>
        }

        return(

            <div>
                <NavigationBar />
                <div>
                    <div className="title">
                        { `Episode ${ this.props.episode.serial_number }${ this.state.title }${ this.state.premiereDate }` }
                    </div>
                    <div className="d-flex flex-column">
                        <div className="d-flex justify-content-center">
                            { description }
                        </div>
                        <div>
                            <VideoWithKeyWords episode_id={ this.props.episode.episode_id } />
                        </div>
                    </div>
                </div>
            </div>

        )

    }

}

export default Episode;
