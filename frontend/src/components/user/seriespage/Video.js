import React, { Component } from 'react';

import serverAddress from '../../../modules/server';

import '../../../styles/info.css';

class Video extends Component {
    render() {

        const address = `${serverAddress}videos/${this.props.episode_id}.mp4`;

        return(

            <div className="video">
                <video id="videoPlayer" width="500px" controls>
                    <source src={ address } type="video/mp4" />
                </video>
            </div>

        );

    }
}

export default Video;
