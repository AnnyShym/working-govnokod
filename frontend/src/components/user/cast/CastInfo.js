import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

import SeriesBlock from './SeriesBlock';

import serverAddress from '../../../modules/server';
import addZeros from '../../../modules/add_zeros';

import '../../../styles/cover.css';
import '../../../styles/cast.css';

const IMDB_LENGTH = 7;

class CastInfo extends Component {
    render() {

        const address = `${serverAddress}${this.props.cast}/${this.props.id}.jpg`;

        let fullName = "";
        if (this.props.castInfo.pseudonym) {
            fullName = `${this.props.castInfo.pseudonym} ${this.props.castInfo.surname}`;
        }
        else {
            fullName = `${this.props.castInfo.name} ${this.props.castInfo.surname}`;
        }

        let imdbLink = "";
        if (this.props.castInfo.imdb_id) {
            imdbLink = `https://www.imdb.com/name/nm${addZeros(
            String(this.props.castInfo.imdb_id), IMDB_LENGTH)}`;
        }

        let biography = null;
        if (this.props.castInfo.biography) {
            biography = this.props.castInfo.biography.split('\n');
        }

        return(

            <div className="d-flex flex-column bg-white">
                <div className="d-flex p-4">
                    <div>
                        <Link to={ `/${this.props.cast}/${this.props.id}` } rel="noopener">
                            <img src={ address } alt={ fullName } className="cover" />
                        </Link>
                    </div>
                    <div className="d-flex flex-column justify-content-center w-100 ml-5">
                        <div>
                            <div className="w-100 pb-3">
                                <Link to={ `/${this.props.cast}/${this.props.id}` } className="name">
                                    { fullName }
                                </Link>
                            </div>
                            <div className="d-flex justify-content-between border-y py-4">
                                <div className="d-flex">
                                    <div className="d-flex flex-column text-secondary">
                                        <span>
                                            Name:
                                        </span>
                                        { this.props.castInfo.middle_name ?
                                            <span>
                                                Middle Name:
                                            </span>
                                        :
                                            <span></span>
                                        }
                                        <span>
                                            Surname:
                                        </span>
                                        { this.props.castInfo.pseudonym ?
                                            <span>
                                                Pseudonym:
                                            </span>
                                        :
                                            <span></span>
                                        }
                                        <span>
                                            Country:
                                        </span>
                                        <span>
                                            Date Of Birth:
                                        </span>
                                        { imdbLink ?
                                            <span>
                                                IMDb:
                                            </span>
                                        :
                                            <span></span>
                                        }
                                    </div>
                                    <div className="d-flex flex-column ml-5">
                                        <span>
                                            { this.props.castInfo.name }
                                        </span>
                                        <span>
                                            { this.props.castInfo.middle_name ?
                                                this.props.castInfo.middle_name
                                            :
                                                ""
                                            }
                                        </span>
                                        <span>
                                            { this.props.castInfo.surname }
                                        </span>
                                        <span>
                                            { this.props.castInfo.pseudonym ?
                                                this.props.castInfo.pseudonym
                                            :
                                                ""
                                            }
                                        </span>
                                        <span>
                                            { this.props.castInfo.country ?
                                                this.props.castInfo.country
                                            :
                                                ""
                                            }
                                        </span>
                                        <span>
                                            { this.props.castInfo.date_of_birth ?
                                                <Moment format="MMMM DD, YYYY">
                                                    { this.props.castInfo.date_of_birth }
                                                </Moment>
                                            :
                                                ""
                                            }
                                        </span>
                                        { (imdbLink === "") ?
                                            <span></span>
                                        :
                                            <span>
                                                <a target="_blanc" href={ imdbLink }>
                                                    { imdbLink }
                                                </a>
                                            </span>
                                        }
                                    </div>
                                </div>
                                <div className="d-flex flex-column justify-content-center w-25 mr-5">
                                    <SeriesBlock cast={ this.props.cast } id={ this.props.id } />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex flex-column p-4">
                    <div className="d-flex pb-3 mb-5 header">
                        <div>
                            <img src={ require("../../../img/biography.png") } alt="Biography" width="30px" height="30px" />
                        </div>
                        <div className="ml-2 d-flex flex-column justify-content-center font-weight-bold">
                            Biography
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        { biography ?
                            <div className="w-75 p-5 shadow biography">
                            {
                                biography.map((str, index) =>
                                    ((index + 1) === biography.length) ?
                                        <p key={ index } className="mb-0">{ str }</p>
                                    :
                                        <p key={ index }>{ str }</p>
                                )
                            }
                            </div>
                        :
                            ""
                        }
                    </div>
                </div>
            </div>

        )

    }
}

export default CastInfo;
