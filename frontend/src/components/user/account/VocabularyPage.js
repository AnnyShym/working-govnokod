import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/account.css';

class VocabularyPage extends Component {

    constructor(props) {

        super(props);

        this.state = {
            vocabulary: null,
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getVocabulary();
    }

    getVocabulary() {
        axios.get(`${serverAddress}all-vocabulary`,
            {withCredentials: true})
        .then(response => {          
            this.setState({
                vocabulary: response.data.rows,
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

    onClickAudio = (id) => {
        let audio = new Audio(`${serverAddress}audio/${id}.mp3`);
        audio.play();
    }

    render() {

        if (this.state.vocabulary === null) {
            return null;
        }

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        if (this.state.vocabulary.length === 0) {
            return(
                <div className="h-100 d-flex justify-content-center">
                    <div className="w-50 d-flex flex-column justify-content-center">
                        <div className="alert alert-light account-shadow d-flex justify-content-center">
                            <div>
                                You have no words in your vocabulary.
                                <br />
                                Check out our new episodes to get some material. :)
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return(

            <div class="table-wrapper-scroll-y table-scrollbar h-100">
                <table className="table bg-white overflow-auto">
                    <thead className="clr-purple">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Word</th>
                            <th scope="col">Translation</th>
                            <th scope="col">Progress</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        { 
                            this.state.vocabulary.map((row, id) => {
                                return(
                                    <tr>
                                        <th scope="row" width="15%">{ id }</th>
                                        <td width="25%">{ row.word }</td>
                                        <td width="25%">{ row.translation }</td>
                                        <td width="15%">{ row.progress.replace('_', ' ') }</td>
                                        <td width="5%"><img src={ require('../../../img/audio.png') } onClick={ () => this.onClickAudio(row.word) } alt="Audio" className="w-50 pointer"/></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>

        );

    }

}

export default VocabularyPage;
