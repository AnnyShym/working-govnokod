import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Moment from 'react-moment';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/article.css';
import '../../../styles/cover.css';
import '../../../styles/link.css';
import '../../../styles/tag.css';

class ArticleCard extends Component {

    constructor(props) {

        super(props);

        this.state = {
            series: [],
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.loadSeries();
    }

    loadSeries = () => {
        axios.get(`${serverAddress}articles/${this.props.article.article_id}/series`,
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

        let CROP_VALUE = 850;

        let address = null;
        if (this.props.type === "card") {
            address = `${serverAddress}news/small/${this.props.article.article_id}.jpg`;
        }
        else {
            address = `${serverAddress}news/${this.props.article.article_id}.jpg`;
        }

        let content = null;
        if (this.props.type === "card") {
            content = `${this.props.article.content.substring(0, CROP_VALUE)}...`;
        }
        else {
            content = this.props.article.content;
        }
        const contentArr = content.split('\n');

        let shadow = "";
        if (this.props.type === "card") {
            shadow = " shadow";
        }

        return(

            <div className={ `bg-white p-4 mb-2${shadow}` }>
                <div className="d-flex flex-column">
                    <div className="pb-3 border-b">
                        <Link to={ `/articles/${this.props.article.article_id}` } className="article-title link">
                            { this.props.article.title }
                        </Link>
                        <div className="article-datetime">
                            <Moment format="MMMM D YYYY, LT">
                                { this.props.article.publication_date }
                            </Moment>
                        </div>
                    </div>
                    <div className="py-4 border-b">
                        <div>
                            <Link to={ `/articles/${this.props.article.article_id}` } rel="noopener" className="float-left mb-4 mr-4">
                                <img src={ address } alt={ this.props.article.title } className="cover" width="210px" height="300px" />
                            </Link>
                        </div>
                        <div>
                            {
                                contentArr.map((str, index) =>
                                    ((index + 1) === contentArr.length) ?
                                        <p key={ index } className="mb-1">{ str }</p>
                                    :
                                        <p key={ index }>{ str }</p>
                                )
                            }
                        </div>
                    </div>
                    <div className="d-flex justify-content-end pt-3">
                        {
                            this.state.series.map((series) => {
                                return(

                                    <Link to={ `/series/${series.series_id}` } key={ series.series_id } className="tag lowercase ml-3 px-3 py-1 d-flex flex-column justify-content-center tag-text">
                                        • { series.title }
                                    </Link>

                                )
                            })
                        }
                    </div>
                </div>
            </div>

        );

    }

}

export default ArticleCard;
