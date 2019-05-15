import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';
import socketIOClient from 'socket.io-client';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';
import getDate from '../../../modules/get_date';
import addZeros from '../../../modules/add_zeros';

import '../../../styles/series_info.css';
import '../../../styles/cover.css';

const IMDB_LENGTH = 7;

class SeriesInfo extends Component {

    constructor(props) {

        super(props);

        this.state = {
            series: [],
            rating: [false, false, false, false, false],
            rated: false,
            saved: false,
            allowed: true,
            errors: []
        };

        this.onClickRating1 = this.onClickRating1.bind(this);
        this.onClickRating2 = this.onClickRating2.bind(this);
        this.onClickRating3 = this.onClickRating3.bind(this);
        this.onClickRating4 = this.onClickRating4.bind(this);
        this.onClickRating5 = this.onClickRating5.bind(this);

        this.socket = socketIOClient(serverAddress);

    }

    componentDidMount() {
        this.getSeries();
        this.getRatedValue();
        this.getRating();
    }

    getSeries() {
        axios.get(`${serverAddress}series/${this.props.series_id}`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                series: response.data.row,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    series: [],
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    series: [],
                    errors: err.response.data.errors
                });
            }
        })
    }

    getRatedValue() {

        const token = document.cookie.replace(/(?:(?:^|.*;\s*)user_auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        this.socket.emit('get rated value', this.props.series_id, token);
        this.socket.on('get rated value', (res) => {
            if (res.statusCode === statusCodes.OK) {
                if (res.row.length > 0) {

                    const ratingValue = res.row[0].rating_value;
                    let newRating = this.state.rating;
                    for (let i = 0; i <= ratingValue; i++) {
                        newRating[i] = true;
                    }

                    this.setState({
                        rating: newRating,
                        rated: true,
                        allowed: true,
                        errors: []
                    })

                }
            }
            else {
                console.log(`${res.statusCode}: ${res.errors}`);
                if (res.statusCode === statusCodes.UNAUTHORIZED) {
                    this.setState({
                        allowed: false,
                        errors: res.errors
                    });
                }
                if (res.statusCode === statusCodes.INTERNAL_SERVER_ERROR) {
                    this.setState({
                        errors: res.errors
                    });
                }
            }
        })
    }

    getRating() {
        this.socket.on('get rating', (res) => {
            if (res.statusCode === statusCodes.OK) {
                this.setState({
                    series : [{
                        ...this.state.series[0],
                        rating: res.row[0].rating
                    }]
                });
            }
            else {
                console.log(`${res.statusCode}: ${res.errors}`);
                if (res.statusCode === statusCodes.UNAUTHORIZED) {
                    this.setState({
                        allowed: false,
                        errors: res.errors
                    });
                }
                if (res.statusCode === statusCodes.INTERNAL_SERVER_ERROR) {
                    this.setState({
                        errors: res.errors
                    });
                }
            }
        })

    }

    onClickRating1(e) {
        this.onClickRating(1);
    }

    onClickRating2(e) {
        this.onClickRating(2);
    }

    onClickRating3(e) {
        this.onClickRating(3);
    }

    onClickRating4(e) {
        this.onClickRating(4);
    }

    onClickRating5(e) {
        this.onClickRating(5);
    }

    onClickRating(ratingValue) {
        if (!this.state.rated) {

            const token = document.cookie.replace(/(?:(?:^|.*;\s*)user_auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

            this.socket.emit('save rating', this.props.series_id, ratingValue,
                token);
            this.socket.on('save rating', (res) => {
                if (res.statusCode === statusCodes.CREATED) {

                    let newRating = this.state.rating;
                    for (let i = 0; i <= ratingValue; i++) {
                        newRating[i] = true;
                    }

                    this.setState({
                        rating: newRating,
                        rated: true,
                        allowed: true,
                        saved: true,
                        errors: []
                    })

                }
                else {
                    console.log(`${res.statusCode}: ${res.errors}`);
                    if (res.statusCode === statusCodes.UNAUTHORIZED) {
                        this.setState({
                            allowed: false,
                            saved: false,
                            errors: res.errors
                        });
                    }
                    if (res.statusCode === statusCodes.INTERNAL_SERVER_ERROR ||
                        res.statusCode === statusCodes.BAD_REQUEST) {
                        this.setState({
                            saved: false,
                            errors: res.errors
                        });
                    }
                }
            });

        }
    }

    render() {

        if (this.state.series.length === 0 && this.state.errors.length === 0) {
            return <div></div>;
        }
        else {

            if (!this.state.allowed) {
                return <Redirect to="/signin" />
            }

            const errorBlocks = this.state.errors.map((error) =>
                <div key={ error.msg } className="container">
                    <div className="alert alert-danger">{ error.msg }</div>
                </div>
            );

            const address = `${serverAddress}covers/${
                this.state.series[0].series_id}.jpg`;
            const imdbLink = `https://www.imdb.com/title/tt${addZeros(
                String(this.state.series[0].imdb_id), IMDB_LENGTH)}`;

            return(

                <div>
                    { (this.state.errors.length > 0) ?
                        <div className="card">
                            <div className="card-body">
                                { errorBlocks }
                            </div>
                        </div>
                    :
                        <div className="card">
                            <div className="card-body">
                                <Link to={ `/series/${this.state.series[0].series_id}` } rel="noopener">
                                    <img src={ address} alt={ this.state.series[0].title } className="cover"/>
                                </Link>
                                <div className="series-info">
                                    <Link to={ `/series/${this.state.series[0].series_id}` } className="series-title">{ this.state.series[0].title }</Link>
                                    <hr />
                                    <span>Rating: { this.state.series[0].rating }</span>
                                    <br />
                                    <span>Country: { this.state.series[0].country }</span>
                                    <br />
                                    <span>Language: { this.state.series[0].original_language }</span>
                                    <br />
                                    <span>Premiere Date: { getDate(this.state.series[0].premiere_date) }</span>
                                    <br />
                                    <span>Age Limit: { this.state.series[0].age_limit }</span>
                                    <br />
                                    <span>Opening Theme: { this.state.series[0].opening_theme }</span>
                                    <br />
                                    <span>IMDb: <a target="_blanc" href={ imdbLink }>{ imdbLink }</a></span>
                                    <hr />
                                    <p className="series-description">Description: { this.state.series[0].description }</p>
                                    <hr />
                                    <span className="rating-span">Rate:</span>
                                    <ul className="rating">
                                        <li onClick={ this.onClickRating1 }>
                                            { this.state.rating[1] ?
                                                <img src={ require('../../../img/star.png') } alt="1 Star" />
                                            :
                                                <img src={ require('../../../img/empty_star.png') } alt="1 Star" />
                                            }
                                        </li>
                                        <li onClick={ this.onClickRating2 }>
                                        { this.state.rating[2] ?
                                            <img src={ require('../../../img/star.png') } alt="2 Stars" />
                                        :
                                            <img src={ require('../../../img/empty_star.png') } alt="2 Stars" />
                                        }
                                        </li>
                                        <li onClick={ this.onClickRating3 }>
                                        { this.state.rating[3] ?
                                            <img src={ require('../../../img/star.png') } alt="3 Stars" />
                                        :
                                            <img src={ require('../../../img/empty_star.png') } alt="3 Stars" />
                                        }
                                        </li>
                                        <li onClick={ this.onClickRating4 }>
                                        { this.state.rating[4] ?
                                            <img src={ require('../../../img/star.png') } alt="4 Stars" />
                                        :
                                            <img src={ require('../../../img/empty_star.png') } alt="4 Stars" />
                                        }
                                        </li>
                                        <li onClick={ this.onClickRating5 }>
                                        { this.state.rating[5] ?
                                            <img src={ require('../../../img/star.png') } alt="5 Stars" />
                                        :
                                            <img src={ require('../../../img/empty_star.png') } alt="5 Stars" />
                                        }
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    }
                </div>

            )

        }
    }
}

export default SeriesInfo;
