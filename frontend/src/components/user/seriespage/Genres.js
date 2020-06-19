import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/genre.css';

class Genres extends Component {

    constructor(props) {

        super(props);

        this.state = {
            genres: null,
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getGenres();
    }

    getGenres() {
        axios.get(`${serverAddress}series/${this.props.seriesId}/genres`,
            {withCredentials: true})
        .then(response => {
            this.setState({
                genres: response.data.rows,
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

        if (this.state.genres === null) {
            return null;
        }

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        return(

            <div className="d-flex justify-content-start">
                { (this.state.genres.length > 0) ?
                    this.state.genres.map((genre) => {
                        return(

                            <Link to={ `/series/genres/${genre.genre_id}` } key={ genre.genre_id } className="lowercase mr-2">
                                { genre.name }
                            </Link>

                        )
                    })
                :
                    <span>Not Specified</span>
                }   
            </div>

        );

    }

}

export default Genres;
