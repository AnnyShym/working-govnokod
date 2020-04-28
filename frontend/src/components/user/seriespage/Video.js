import React, { Component } from 'react';

import serverAddress from '../../../modules/server';

import '../../../styles/info.css';

class Video extends Component {
    render() {

        const videoAddress = `${serverAddress}videos/${this.props.episode_id}.mp4`;
        const subtitlesAddress = `${serverAddress}subtitles/${this.props.episode_id}.vtt`;

        return(

            <div className="video">
                <video id="videoPlayer" width="500px" controls crossOrigin="anonymous">
                    <source src={ videoAddress } type="video/mp4" />
                    <track src={ subtitlesAddress } kind="subtitles" srcLang="en" label="English" default />
                </video>
            </div>

        );

    }
}

export default Video;
