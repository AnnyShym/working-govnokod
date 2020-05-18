import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/account.css';

class AwardsPage extends Component {

    constructor(props) {

        super(props);

        this.state = {
            totalCount: 0,
            correctCount: 0,
            learnedCount: 0,
            allowed: true,
            errors: []
        };

        this.totalAward3 = 100;
        this.totalAward2 = 1000;
        this.totalAward1 = 10000;
        this.totalAward0 = 50000;

        this.correctAward3 = 50;
        this.correctAward2 = 500;
        this.correctAward1 = 5000;
        this.correctAward0 = 10000;

        this.learnedAward3 = 25;
        this.learnedAward2 = 250;
        this.learnedAward1 = 2500;
        this.learnedAward0 = 5000;

    }

    componentDidMount() {
        this.getProgress();
    }

    getProgress() {
        axios.get(`${serverAddress}progress`,
            {withCredentials: true})
        .then(response => {          
            this.setState({
                totalCount: response.data.rows[0].trained_count,
                correctCount: response.data.rows[0].correct_count,
                learnedCount: response.data.rows[0].learned_count,
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

        let totalAwards = [false, false, false, false];
        if (this.state.totalCount >= this.totalAward3) {
            totalAwards[0] = true;
            if (this.state.totalCount >= this.totalAward2) {
                totalAwards[1] = true;
                if (this.state.totalCount >= this.totalAward1) {
                    totalAwards[2] = true;
                    if (this.state.totalCount >= this.totalAward0) {
                        totalAwards[3] = true;
                    } 
                } 
            }
        }

        let correctAwards = [false, false, false, false];
        if (this.state.correctCount >= this.correctAward3) {
            correctAwards[0] = true;
            if (this.state.correctCount >= this.correctAward2) {
                correctAwards[1] = true;
                if (this.state.correctCount >= this.correctAward1) {
                    correctAwards[2] = true
                    if (this.state.correctCount >= this.correctAward0) {
                        correctAwards[3] = true;
                    }   
                }                 
            }
        }

        let learnedAwards = [false, false, false, false];
        if (this.state.learnedCount >= this.learnedAward3) {
            learnedAwards[0] = true;
            if (this.state.learnedCount >= this.learnedAward2) {
                learnedAwards[1] = true;
                if (this.state.learnedCount >= this.learnedAward1) {
                    learnedAwards[2] = true;
                    if (this.state.learnedCount >= this.learnedAward0) {
                        learnedAwards[3] = true;
                    } 
                } 
            }
        }

        return(

            <div className="h-100 d-flex flex-column p-5 bg-white">
                <div className="d-flex p-5 border-bottom award-block">
                    <div className="w-25 align-self-center clr-purple font-weight-bold">
                        { `Learned Count: ${this.state.learnedCount}` }
                    </div>
                    <div className="w-75">
                        <div>
                            { 
                                learnedAwards.map((value, id) => {
                                    return <img src={ value ? require(`../../../img/${id}.png`) : require("../../../img/no_award.png") } width="13%" alt="Award" 
                                        className={ value ? "mr-5" : "transparent mr-5" } />
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="d-flex p-5 border-bottom award-block">
                    <div className="w-25 align-self-center clr-orange font-weight-bold">
                        { `Correct Count: ${this.state.correctCount}` }
                    </div>
                    <div className="w-75">
                        <div>
                            { 
                                correctAwards.map((value, id) => {
                                    return <img src={ value ? require(`../../../img/${id}.png`) : require("../../../img/no_award.png") } width="13%" alt="Award" 
                                        className={ value ? "mr-5" : "transparent mr-5" } />
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="d-flex p-5 award-block">
                    <div className="w-25 align-self-center clr-yellow font-weight-bold">
                        { `Total Count: ${this.state.totalCount}` }
                    </div>
                    <div className="w-75">
                        <div>
                            { 
                                learnedAwards.map((value, id) => {
                                    return <img src={ value ? require(`../../../img/${id}.png`) : require("../../../img/no_award.png") } width="13%" alt="Award" 
                                        className={ value ? "mr-5" : "transparent mr-5" } />
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>

        );

    }

}

export default AwardsPage;
