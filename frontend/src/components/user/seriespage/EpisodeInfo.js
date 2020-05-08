import React, { Component } from 'react';

import VideoWithKeyWords from './VideoWithKeyWords';

import getDate from '../../../modules/get_date';

import '../../../styles/info.css';

class EpisodeInfo extends Component {

    constructor(props) {

        super(props);

        this.state = {
            title: '',
            premiereDate: '',
            expanded: false,
        };

        this.onExpand = this.onExpand.bind(this);

    }

    componentWillMount() {

        let title = '';
        if (this.props.episode.title !== null && this.props.episode.title !== '') {
            title = ` "${ this.props.episode.title }"`;
        }

        let premiereDate = '';
        if (this.props.episode.premiere_date !== null) {
            premiereDate = ` (${ getDate(this.props.episode.premiere_date) })`;
        }

        this.setState({
            title: title,
            premiereDate: premiereDate
        });

    }

    onExpand() {
        this.setState({
            expanded: !this.state.expanded
        });
    }

    render() {

        let description = null;
        if (this.state.expanded) {
            if (this.props.episode.description !== null &&
                this.props.episode.description !== '') {
                description = <p>Description: { this.props.episode.description }</p>
            }
        }

        return(

            <div>
                <div onClick={ this.onExpand } className="title">Episode { this.props.episode.serial_number }{ this.state.title }{ this.state.premiereDate }</div>
                { this.state.expanded ?
                    <div>
                        { description }
                        <VideoWithKeyWords episode_id={ this.props.episode.episode_id } />
                    </div>
                :
                    <div></div>
                }
            </div>

        )

    }
}

export default EpisodeInfo;
