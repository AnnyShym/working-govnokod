import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/tag.css';

class Tags extends Component {

    constructor(props) {

        super(props);

        this.state = {
            tags: null,
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getTags();
    }

    getTags() {
        axios.get(`${serverAddress}series/${this.props.seriesId}/tags`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                tags: response.data.rows,
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

        if (this.state.tags === null) {
            return null;
        }

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        if (this.state.tags.length === 0) {
            return null;
        }

        return(

            <div className="d-flex justify-content-between">
                {
                    this.state.tags.map((tag) => {
                        return(

                            <Link to={ `/series/tag/${tag.tag_id}` } key={ tag.tag_id } className="tag lowercase ml-3 px-3 py-1 d-flex flex-column justify-content-center tag-text">
                                • { tag.name }
                            </Link>

                        )
                    })
                }   
            </div>

        );

    }

}

export default Tags;
