import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';
import socketIOClient from 'socket.io-client';

import Tags from './Tags';
import Genres from './Genres';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';
import getDate from '../../../modules/get_date';
import addZeros from '../../../modules/add_zeros';

import '../../../styles/series_info.css';
import '../../../styles/cover.css';
import '../../../styles/rating.css';

const IMDB_LENGTH = 7;

class SeriesInfo extends Component {

    constructor(props) {

        super(props);

        this.state = {
            series: [],
            rating: [false, false, false, false, false],
            rated: false,
            isFavourite: false,
            isWatched: false,
            isWished: false,
            allowed: true,
            errors: []
        };

        this.socket = socketIOClient(serverAddress);

    }

    componentDidMount() {
        this.getSeries();
        this.getRatedValue();
        this.getRating();
        this.getIsFavourite();
        this.getIsWatched();
        this.getIsWished();
    }

    getSeries() {
        axios.get(`${serverAddress}series/${this.props.seriesId}`,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                series: response.data.rows,
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
            else {
                this.setState({
                    series: [],
                    errors: err.response.data.errors
                });
            }
        })
    }

    getRatedValue() {

        const token = document.cookie.replace(/(?:(?:^|.*;\s*)user_auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        this.socket.emit('get rated value', this.props.seriesId, token);
        this.socket.on('get rated value', (res) => {
            if (res.statusCode === statusCodes.OK) {
                if (res.row.length > 0) {
                    if (res.token === token) {

                        const ratingValue = res.row[0].rating_value;
                        let newRating = this.state.rating;
                        for (let i = 0; i <= (ratingValue - 1); i++) {
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
            }
            else {
                console.log(`${res.statusCode}: ${res.errors}`);
                if (res.statusCode === statusCodes.UNAUTHORIZED) {
                    this.setState({
                        allowed: false,
                        errors: res.errors
                    });
                }
                else {
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
                else {
                    this.setState({
                        errors: res.errors
                    });
                }
            }
        })
    }

    getIsFavourite() {
        axios.get(`${serverAddress}is-favourite/${this.props.seriesId}`,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                isFavourite: (response.data.rows.length > 0),
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
            else {
                this.setState({
                    series: [],
                    errors: err.response.data.errors
                });
            }
        })
    }

    getIsWatched() {
        axios.get(`${serverAddress}is-already-watched/${this.props.seriesId}`,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                isWatched: (response.data.rows.length > 0),
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
            else {
                this.setState({
                    series: [],
                    errors: err.response.data.errors
                });
            }
        })
    }

    getIsWished() {
        axios.get(`${serverAddress}is-in-wish-list/${this.props.seriesId}`,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                isWished: (response.data.rows.length > 0),
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
            else {
                this.setState({
                    series: [],
                    errors: err.response.data.errors
                });
            }
        })
    }

    onClickRating = (ratingValue) => {
        if (!this.state.rated) {

            const token = document.cookie.replace(/(?:(?:^|.*;\s*)user_auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

            this.socket.emit('save rating', this.props.seriesId, ratingValue,
                token);
            this.socket.on('save rating', (res) => {
                if (res.statusCode !== statusCodes.CREATED) {
                    console.log(`${res.statusCode}: ${res.errors}`);
                    if (res.statusCode === statusCodes.UNAUTHORIZED) {
                        this.setState({
                            allowed: false,
                            errors: res.errors
                        });
                    }
                    if (res.statusCode === statusCodes.INTERNAL_SERVER_ERROR ||
                        res.statusCode === statusCodes.BAD_REQUEST) {
                        this.setState({
                            errors: res.errors
                        });
                    }
                }
            });

        }
    }

    onClickAddToFavourites = () => {

        const body = {
            seriesId: this.props.seriesId
        };

        axios.post(`${serverAddress}favourites`, body,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                isFavourite: true,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })

    }

    onClickRemoveFromFavourites = () => {
        axios.delete(`${serverAddress}favourites/${this.props.seriesId}`,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                isFavourite: false,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        }) 
    }

    onClickAddToWatched = () => {

        const body = {
            seriesId: this.props.seriesId
        };

        axios.post(`${serverAddress}already-watched`, body,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                isWatched: true,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })

    }

    onClickRemoveFromWatched = () => {
        axios.delete(`${serverAddress}already-watched/${this.props.seriesId}`,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                isWatched: false,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        }) 
    }

    onClickAddToWished = () => {

        const body = {
            seriesId: this.props.seriesId
        };

        axios.post(`${serverAddress}wish-list`, body,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                isWished: true,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })

    }

    onClickRemoveFromWished = () => {
        axios.delete(`${serverAddress}wish-list/${this.props.seriesId}`,
            {withCredentials: true})    
        .then(response => {
            this.setState({
                isWished: false,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        }) 
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

            let imdbLink = "";
            if (this.state.series[0].imdb_id) {
                imdbLink = `https://www.imdb.com/title/tt${addZeros(
                String(this.state.series[0].imdb_id), IMDB_LENGTH)}`;
            }

            return(

                <div className="border-btm">
                    { (this.state.errors.length > 0) ?
                        <div className="card">
                            <div className="card-body">
                                { errorBlocks }
                            </div>
                        </div>
                    :
                        <div className="card">
                            <div className="d-flex card-body px-4">
                                <div>
                                    <Link to={ `/series/${this.state.series[0].series_id}` } rel="noopener">
                                        <img src={ address} alt={ this.state.series[0].title } className="cover"/>
                                    </Link>
                                </div>
                                <div className="w-100 ml-5">
                                    <div className="w-100 d-flex justify-content-between">
                                        <div>
                                            <Link to={ `/series/${this.state.series[0].series_id}` } className="series-title">{ this.state.series[0].title }</Link>
                                        </div>
                                        <div className="d-flex">
                                            <div>
                                                { this.state.isWished?
                                                    <img src={ require('../../../img/wish_list.png') } onClick={ this.onClickRemoveFromWished } width="30px" height="30px" alt="In Wish List" className="pointer" />
                                                :
                                                    <img src={ require('../../../img/wish_list_outline.png') } onClick={ this.onClickAddToWished } width="30px" height="30px" alt="Add To Wish List" className="pointer" />
                                                }
                                            </div>
                                            <div className="ml-2">
                                                { this.state.isWatched ?
                                                    <img src={ require('../../../img/eye.png') } onClick={ this.onClickRemoveFromWatched } width="30px" height="30px" alt="In Already Watched" className="pointer" />
                                                :
                                                    <img src={ require('../../../img/eye_outline.png') } onClick={ this.onClickAddToWatched } width="30px" height="30px" alt="Add To Already Watched" className="pointer" />
                                                }
                                            </div>
                                            <div className="ml-5">
                                                { this.state.isFavourite ?
                                                    <img src={ require('../../../img/star.png') } onClick={ this.onClickRemoveFromFavourites } width="30px" height="30px" alt="In Favourites" className="pointer" />
                                                :
                                                    <img src={ require('../../../img/star_outline.png') } onClick={ this.onClickAddToFavourites } width="30px" height="30px" alt="Add To Favourites" className="pointer" />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <span>Rating: { this.state.series[0].rating.toFixed(1) }</span>
                                    <br />
                                    <span>Country: { this.state.series[0].country }</span>
                                    <br />
                                    <span>Original Language: { this.state.series[0].original_language }</span>
                                    <br />
                                    <span>English Level: { this.state.series[0].english_level }</span>
                                    <br />
                                    <span>Premiere Date: { (this.state.series[0].premiere_date === null) ? "" : getDate(this.state.series[0].premiere_date) }</span>
                                    <br />
                                    <div className="d-flex">
                                        <div>Genres:</div>
                                        <Genres seriesId={ this.state.series[0].series_id } />
                                    </div>
                                    <span>Age Limit: { this.state.series[0].age_limit }</span>
                                    <br />
                                    { (this.state.series[0].opening_theme === null) ?
                                        <span></span>
                                    :
                                        <div>Opening Theme: { this.state.series[0].opening_theme }</div>
                                    }
                                    { (imdbLink === "") ?
                                        <span></span>
                                    :
                                        <span>IMDb: <a target="_blanc" href={ imdbLink }>{ imdbLink }</a></span>
                                    }
                                    <hr />
                                    <p className="m-0">Description: { (this.state.series[0].description === null) ? "" : this.state.series[0].description }</p>
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <div className="d-flex">
                                            <div className="d-flex flex-column justify-content-center rating-span">
                                                Rate:
                                            </div>
                                            <div className="d-flex flex-column justify-content-center ml-2">
                                                <ul className="rating m-0 p-0">
                                                    { 
                                                        this.state.rating.map((star, index) =>
                                                            <li onClick={ () => this.onClickRating(index + 1) } key={ index + 1 } className="d-flex flex-column justify-content-center">
                                                                { star ?
                                                                    <img src={ require('../../../img/star.png') } alt={ `Full Star ${index + 1}` } />
                                                                :
                                                                    <img src={ require('../../../img/star_outline.png') } alt={ `Empty Star ${index + 1}` } />
                                                                }
                                                            </li>
                                                        )
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                        <Tags seriesId={ this.state.series[0].series_id } />
                                    </div>
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
