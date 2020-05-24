import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import serverAddress from '../../../modules/server';

import '../../../styles/season_info.css';

class SeasonInfo extends Component {
    render() {

        let title = '';
        let premiereDate = '';
        let description = null;
        let episodeBlocks = null;
        let errorBlocks = null;

        if (this.props.season.title) {
            title = ` "${ this.props.season.title }"`;
        }

        if (title) {
            if (this.props.season.premiere_date) {
                premiereDate = ` (${ moment(this.props.season.premiere_date).format("MMMM D, YYYY") })`;
            }
        }

        if (this.props.season.description) {
            description = this.props.season.description.split('\n');
        }

        if (this.props.episodes) {
            episodeBlocks = this.props.episodes.map((episode, index) =>
                <div className="card w-25 m-5 shadow" key={ index }>
                    <img src={ `${serverAddress}episodes/small/${episode.episode_id}.jpg` } alt="Episode Cover" className="card-img-top" />
                    <div className="card-body">
                        <h5 className="card-title">
                            Episode { episode.serial_number }
                        </h5>
                        { (episode.title) ?
                            <h6 className="card-subtitle mb-2 text-muted">
                                "{ episode.title }"
                            </h6>
                        :
                            <h6 className="card-subtitle mb-2 text-muted">
                                No Title
                            </h6>
                        }
                        <Link to={ `/series/${this.props.seriesId}/seasons/${
                            this.props.season.serial_number}/episodes/${
                            episode.serial_number}` } className="card-link">
                            Watch
                        </Link>                            
                    </div>
                </div>
            );
        }

        return(

            <div>
                <div className="d-flex flex-column justify-content-between">
                    { title ?
                        <div className="my-5 d-flex justify-content-center season-title">
                            { title }{ premiereDate }
                        </div>
                    :
                        <div></div>
                    }
                    <div className="d-flex justify-content-center">                        
                        { description ?  
                            <div className="w-75 p-5 mb-5 shadow description">  
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
                    <div className="d-flex justify-content-center flex-wrap">
                        { episodeBlocks }
                    </div>
                </div>
            </div>

        )

    }
    
}

export default SeasonInfo;
