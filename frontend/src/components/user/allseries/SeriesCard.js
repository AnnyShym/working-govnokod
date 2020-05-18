import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import serverAddress from '../../../modules/server';
import getDate from '../../../modules/get_date';

import '../../../styles/series_info.css';
import '../../../styles/cover.css';
import '../../../styles/link.css';

class SeriesCard extends Component {
    render() {

        const CROP_VALUE = 300;
        const address = `${serverAddress}covers/small/${this.props.series.series_id}.jpg`;

        return(

            <div className="h-100 bg-white p-4 mb-2 shadow">
                <div className="h-100 d-flex">
                    <div>
                        <Link to={ `/series/${this.props.series.series_id}` } rel="noopener">
                            <img src={ address} alt={ this.props.series.title } className="cover" />
                        </Link>
                    </div>
                    <div className="ml-4">
                        <Link to={ `/series/${this.props.series.series_id}` } className="series-title link">{ this.props.series.title }</Link>
                        <hr />
                        <span>Rating: { this.props.series.rating.toFixed(1) }</span>
                        <br />
                        <span>Country: { this.props.series.country }</span>
                        <br />
                        <span>Original Language: { this.props.series.original_language }</span>
                        <br />
                        <span>English Level: { this.props.series.english_level }</span>
                        <br />
                        <span>Premiere Date: { (this.props.series.premiere_date === null) ? "" : getDate(this.props.series.premiere_date) }</span>
                        <hr />
                        <p className="m-0">Description: { (this.props.series.description === null) ? "" : `${this.props.series.description.substring(0, CROP_VALUE)}...` }</p>
                    </div>
                </div>
            </div>

        );

    }
}

export default SeriesCard;
