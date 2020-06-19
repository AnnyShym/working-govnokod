import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import axios from 'axios';

import Review from './Review';
import AddReviewForm from './AddReviewForm';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/comment.css';

class ReviewsBlock extends Component {

    constructor(props) {

        super(props);

        this.state = {
            reviews: null,
            userId: null,
            allowed: true,
            errors: []
        };

        this.socket = socketIOClient(serverAddress);

    }

    componentDidMount() {
        this.getReviews();
        this.getNewReview();
        this.getDeletedReview();
    }

    getReviews() {
        axios.get(`${serverAddress}reviews/${this.props.seriesId}`,
            {withCredentials: true})
        .then(response => {          
            this.setState({
                reviews: response.data.rows,
                userId: response.data.userId,
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

    getNewReview() {
        this.socket.on('get new review', (res) => {
            if (res.statusCode === statusCodes.OK) {
                if (res.rows[0].series_id === this.props.seriesId) {
                    this.setState({
                        reviews : [ res.rows[0], ...this.state.reviews ]
                    });
                }
            }
            else {
                console.log(`${res.statusCode}: ${res.errors}`);
                this.setState({
                    errors: res.errors
                });
            }
        })
    }

    getDeletedReview() {
        this.socket.on('get deleted review', (res) => {
            if (res.statusCode === statusCodes.OK) {
                if (res.rows[0].series_id === this.props.seriesId) {
                    let reviews = this.state.reviews;
                    for (let i = 0; i < reviews.length; i++) {
                        if (reviews[i].user_id === res.rows[0].user_id) {
                            reviews.splice(i, 1);
                            break;
                        }
                    }
                    this.setState({
                        reviews : reviews
                    });
                }
            }
            else {
                console.log(`${res.statusCode}: ${res.errors}`);
                this.setState({
                    errors: res.errors
                });
            }
        })
    }

    handleDeleteReview = () => {

        const token = document.cookie.replace(/(?:(?:^|.*;\s*)user_auth\s*\=\s*([^;]*).*$)|^.*$/, "$1");

        this.socket.emit('delete review', this.props.seriesId, token);
        this.socket.on('delete review', (res) => {
            if (res.statusCode !== statusCodes.NO_CONTENT) {
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
            else {
                this.setState({
                    allowed: true,
                    errors: []
                });                
            }
        });

    }

    render() {

        if (this.state.reviews === null) {
            return null;
        }

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        return(

            <div className="d-flex flex-column p-4 bg-white">
                <div className="d-flex pb-3 mb-3 header">
                    <div>
                        <img src={ require("../../../img/reviews.png") } alt="Reviews" width="30px" height="30px" />
                    </div>
                    <div className="ml-2 d-flex flex-column justify-content-center font-weight-bold">
                        Reviews ({ this.state.reviews.length })
                    </div>
                </div>
                <AddReviewForm seriesId={ this.props.seriesId } />
                <div className="d-flex justify-content-center">
                    <div className="d-flex flex-column w-50">
                        { 
                            this.state.reviews.map((review, index) => 
                                <Review key={ index } review={ review } userId={ this.state.userId } onDeleteReview={ this.handleDeleteReview } />
                            )
                        }
                    </div>
                </div>
            </div>

        );

    }

}

export default ReviewsBlock;
