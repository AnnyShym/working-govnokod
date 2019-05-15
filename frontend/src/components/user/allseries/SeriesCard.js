import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import serverAddress from '../../../modules/server';
import getDate from '../../../modules/get_date';

import '../../../styles/series_info.css';
import '../../../styles/cover.css';

class SeriesCard extends Component {
    render() {

        const CROP_VALUE = 300;
        const address = `${serverAddress}covers/small/${this.props.series.series_id}.jpg`;

        return(

            <div className="card">
                <div className="card-body">
                    <Link to={ `/series/${this.props.series.series_id}` } rel="noopener">
                        <img src={ address} alt={ this.props.series.title } className="cover" />
                    </Link>
                    <div className="series-card-info">
                        <Link to={ `/series/${this.props.series.series_id}` } className="series-title">{ this.props.series.title }</Link>
                        <hr />
                        <span>Rating: { this.props.series.rating }</span>
                        <br />
                        <span>Country: { this.props.series.country }</span>
                        <br />
                        <span>Language: { this.props.series.original_language }</span>
                        <br />
                        <span>Premiere Date: { getDate(this.props.series.premiere_date) }</span>
                        <hr />
                        <p className="series-description">Description: {this.props.series.description.substring(0, CROP_VALUE)}...</p>
                    </div>
                </div>
            </div>

        );

    }
}

export default SeriesCard;
