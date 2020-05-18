import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import getDate from '../../../modules/get_date';

import '../../../styles/info.css';

class EpisodeInfo extends Component {
    render() {

        let title = '';
        if (this.props.episode.title !== null && this.props.episode.title !== '') {
            title = ` "${ this.props.episode.title }"`;
        }

        let premiereDate = '';
        if (this.props.episode.premiere_date !== null) {
            premiereDate = ` (${ getDate(this.props.episode.premiere_date) })`;
        }

        return(

            <Link to={ `/episodes/${this.props.episode.episode_id}` } className="title">
                Episode { this.props.episode.serial_number }{ title }{ premiereDate }
            </Link>

        )

    }    
}

export default EpisodeInfo;
