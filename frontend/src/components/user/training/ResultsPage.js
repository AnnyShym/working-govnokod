import React, { Component } from 'react';
import axios from 'axios';

import serverAddress from '../../../modules/server';

import '../../../styles/training_page.css';

class ResultPage extends Component {

    constructor(props) {

        super(props);

        this.state = {
            saved: false,
            errors: []
        }

    }

    componentDidMount() {
        this.saveResults();
    }

    saveResults() {

        const body = {
            totalCount: this.props.totalCount,
            correctCount: this.props.correctCount,
            learnedCount: this.props.learnedCount
        };

        axios.post(`${serverAddress}save-progress`, body,
            {withCredentials: true})
        .then(response => {
            this.setState({
                saved: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            this.setState({
                saved: false,
                errors: err.response.data.errors
            });
        })

    }

    render() {
        return(

            <div className="h-100 w-100 d-flex justify-content-center">
                <div className="h-100 d-flex flex-column justify-content-center">
                    <div className="d-flex flex-column m-0 pt-2 px-5 pb-5 border rounded bg-white card-shadow">
                        <div className="d-flex justify-content-end block-tab">
                            <div>
                                <button onClick={ () => this.props.onContinueTraining() } className="btn text-white btn-sm border-0 training-btn">
                                    Continue Learning
                                </button>
                            </div>
                        </div>
                        <div>
                            { (!this.state.saved && (this.state.errors.length > 0)) ?                              
                                <div className="training-err font-weight-bold">
                                    { `${this.state.errors[0].msg}` } 
                                    <br />
                                    The results were not saved.
                                </div>
                            :
                                <div className="result-font font-weight-bold m-5">
                                    Congratulations! The results were saved.
                                </div> 
                            }
                            <div className="d-flex justify-content-center">
                                <img src={ require("../../../img/result_award.png") } alt="Award" width="170px" height="180px" className="award-img-cup" />
                                <img src={ require("../../../img/result.png") } alt="Award" width="300px" height="230px" className="award-img-trophy" />
                            </div>
                            <div className="total-count font-weight-bold mt-5">
                                { `Total Count: ${this.props.totalCount}` }
                            </div>
                            <div className="correct-count font-weight-bold">
                                { `Correct Answers: ${this.props.correctCount}` }
                            </div>
                            <div className="learned-count font-weight-bold">
                                { `Words Learned: ${this.props.learnedCount}` }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

}

export default ResultPage;