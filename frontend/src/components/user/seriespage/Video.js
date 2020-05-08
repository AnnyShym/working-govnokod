import React, { Component } from 'react';

import serverAddress from '../../../modules/server';

class Video extends Component {

    componentDidMount() {

        const videoTrack = document.getElementById("video-track");        

        videoTrack.oncuechange = e => this.props.onCueChange(e);

    }

    render() {

        const videoAddress = `${serverAddress}videos/${this.props.episode_id}.mp4`;
        const subtitlesAddress = `${serverAddress}subtitles/${this.props.episode_id}.vtt`;

        return(

            <div className="d-flex justify-content-center m-5">
                <video width="70%" controls crossOrigin="anonymous" className="border">
                    <source src={ videoAddress } type="video/mp4" />
                    <track src={ subtitlesAddress } kind="subtitles" srcLang="en" label="English" id="video-track" default />
                </video>
            </div>

        );

    }
}

export default Video;
