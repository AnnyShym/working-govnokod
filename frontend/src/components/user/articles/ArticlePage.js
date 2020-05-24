import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import NavigationBar from '../NavigationBar';
import ArticleCard from './ArticleCard';
import CommentsBlock from '../comments/CommentsBlock';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

class ArticlePage extends Component {

    constructor(props) {

        super(props);

        this.state = {
            series: [],
            article: null,
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getArticleInfo();
        this.loadSeries();
    }

    getArticleInfo() {
        axios.get(`${serverAddress}articles/${this.props.match.params.id}`,
            {withCredentials: true})
        .then(response => {
            if (response.data.rows.length > 0) {
                this.setState({
                    article: response.data.rows[0],
                    allowed: true,
                    errors: []
                })
            }
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
            else {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })
    }

    loadSeries = () => {
        axios.get(`${serverAddress}articles/${this.props.match.params.id}/series`,
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
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            else {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })

    }

    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        if (this.state.article === null || this.state.article.length === 0) {
            return null;
        }

        const errorBlocks = this.state.errors.map((error) =>
            <div key={ error.msg } className="container">
                <div className="alert alert-danger">{ error.msg }</div>
            </div>
        );

        return(

            <div>
                { (this.state.errors.length > 0) ?
                    <div className="d-flex flex-column">
                        { errorBlocks }
                    </div>
                :
                    <div>
                        <div>
                            <NavigationBar />
                            <ArticleCard  type="page" article={ this.state.article } />
                            <div className="d-flex flex-column p-4 bg-white">
                                <div className="d-flex pb-3 mb-3 header">
                                    <div>
                                        <img src={ require("../../../img/video.png") } alt="Trailer" width="30px" height="30px" />
                                    </div>
                                    <div className="ml-2 d-flex flex-column justify-content-center font-weight-bold">
                                        Trailer
                                    </div>
                                </div>
                                <div className="d-flex justify-content-center m-5">
                                    <video width="50%" controls crossOrigin="anonymous" className="trailer">
                                        <source src={ `${serverAddress}videos/trailers/${this.props.match.params.id}.mp4` } type="video/mp4" />
                                    </video>
                                </div>
                            </div>
                            <CommentsBlock about="articles" id={ this.props.match.params.id } />
                        </div>
                    </div>
                }
            </div>

        );

    }

}

export default ArticlePage;
