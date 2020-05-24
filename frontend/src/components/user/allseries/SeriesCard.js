import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

import serverAddress from '../../../modules/server';

import '../../../styles/series_info.css';
import '../../../styles/cover.css';
import '../../../styles/link.css';

class SeriesCard extends Component {
    render() {

        const CROP_VALUE = 150;
        const address = `${serverAddress}covers/small/${this.props.series.series_id}.jpg`;

        return(

            <div className="h-100 bg-white p-4 mb-2 shadow">
                <div className="h-100 d-flex">
                    <div>
                        <div className="d-flex flex-column">
                            <Link to={ `/series/${this.props.series.series_id}` } rel="noopener">
                                <img src={ address} alt={ this.props.series.title } className="cover" />
                            </Link>
                            <div className="mt-4">
                                <div className="d-flex justify-content-center">
                                    <div className="d-flex flex-column">
                                        <div>
                                            <img src={ require('../../../img/card_rating.png') } width="35px" height="35px" alt="Rating" />
                                        </div>
                                        <span className="d-flex justify-content-center card-total-rating">
                                            { this.props.series.rating.toFixed(1) }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="pb-3">
                        <Link to={ `/series/${this.props.series.series_id}` } className="series-title link">{ this.props.series.title }</Link>
                        </div>
                        <div className="d-flex border-t border-b py-3">
                            <div className="d-flex flex-column text-secondary">
                                <span>
                                    Country:
                                </span>
                                <span>
                                    Original Language:
                                </span>
                                <span>
                                    English Level:
                                </span>
                                { this.props.series.premiere_date ?
                                    <span>
                                        Premiere Date:
                                    </span>
                                :
                                    <span></span>
                                }
                            </div>
                            <div className="d-flex flex-column ml-5">
                                <span>
                                    { this.props.series.country }
                                </span>
                                <span>
                                    { this.props.series.original_language }
                                </span>
                                <span>
                                    { this.props.series.english_level }
                                </span>
                                { this.props.series.premiere_date ? 
                                    <span>
                                        <Moment format="MMMM D, YYYY">
                                            { this.props.series.premiere_date }
                                        </Moment>
                                    </span>
                                : 
                                    <span></span>
                                }
                            </div>
                        </div>
                        <div className="d-flex pt-3">                            
                            <p className="m-0">
                                <span className="text-secondary">Description:</span>
                                { this.props.series.description ? 
                                    ` ${this.props.series.description.substring(0, CROP_VALUE)}...`
                                :
                                    ""
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        );

    }
}

export default SeriesCard;
