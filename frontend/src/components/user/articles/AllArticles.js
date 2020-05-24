import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import NavigationBar from '../NavigationBar';
import SearchArticles from '../SearchArticles';
import ArticleCard from './ArticleCard';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/article.css';

const ARTICLES_PER_PAGE = 5;

class AllArticles extends Component {

    constructor(props) {

        super(props);

        this.state = {
            currentPage: 0,
            articles: null,
            criteria: null,
            allowed: true,
            errors: []
        };

    }

    loadArticles = (operation) => {

        let currentPage = this.state.currentPage;

        if ((currentPage === 0) &&
            (operation === "previous")) {
            return;
        }

        if (this.state.articles !== null) {
            currentPage = (operation === "next") ? (currentPage + 1) : (currentPage - 1);
        }

        axios.get(`${serverAddress}articles/${this.state.criteria.title}/${this.state.criteria.series}/${
            this.state.criteria.filter.column}/${this.state.criteria.filter.direction}/${
            currentPage}/${ARTICLES_PER_PAGE}`,
            {withCredentials: true})
        .then(response => {
            if (response.data.rows.length > 0) {
                this.setState({
                    articles: response.data.rows,
                    currentPage: currentPage,
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
                    articles: null,
                    currentPage: 0,
                    allowed: false,
                    errors: err.response.data.errors
                });
            }
            else {
                this.setState({
                    articles: null,
                    currentPage: 0,
                    errors: err.response.data.errors
                });
            }
        })

    }

    handeFormRequest = (criteria) => {

        this.setState({
            articles: null,
            currentPage: 0,
            criteria: criteria
        });

        setTimeout(() => this.loadArticles("next"));

    }

    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        let errorBlocks = this.state.errors.map((error) =>
            <div key={ error.msg } className="container">
                <div className="alert alert-danger">{ error.msg }</div>
            </div>
        );

        return(

            <div className="h-100">
                <NavigationBar />
                { (this.state.errors.length > 0) ?
                    <div className="all-articles">
                        { errorBlocks }
                    </div>
                :
                    <div className="all-articles">
                        <div className="d-flex flex-column container all-articles-container">
                            <SearchArticles onFormRequest={ this.handeFormRequest } />
                            { (this.state.articles === null) ?
                                <div className="mb-3">
                                    <div className="d-flex justify-content-center">
                                        Sorry, no articles matched the criteria.
                                    </div>
                                </div>
                            :
                                <div className="p-relative">
                                    <div className="container article-block">
                                        {
                                            this.state.articles.map((article) =>
                                                <ArticleCard key={ article.article_id } type="card" article={ article } />
                                            )
                                        }
                                    </div>
                                    <div className="d-flex justify-content-between p-3">
                                        <button onClick={ () => this.loadArticles("previous") } className="btn btn-dark">Previous</button>
                                        <button onClick={ () => this.loadArticles("next") } className="btn btn-dark">Next</button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                }
            </div>

        );

    }

}

export default AllArticles;
