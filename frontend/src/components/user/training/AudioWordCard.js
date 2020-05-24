import React, { Component } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import axios from 'axios';

import serverAddress from '../../../modules/server';

import '../../../styles/training_page.css';

class AudioWordCard extends Component {

    constructor(props) {

        super(props);

        this.state = {
            userAnswer: "",
            correctAnswer: "",
            isAnswerCorrect: null,
            wasHelpUsed: false,
            wasIncorrect: false,
            errors: []
        };

        this.audio = null;

    }

    onChangeAnswer = (e) => {

        let answer = e;
        if (e.target !== undefined) {
            answer = e.target.value;
        }

        this.setState({
            userAnswer: answer,
            isAnswerCorrect: null,
        });

    }

    onClickShowAnswer = (e) => {
        this.setState({
            userAnswer: "",
            correctAnswer: this.props.word,
            wasHelpUsed: true
        });
    }

    onClickAlreadyLearned = (e) => {

        const body = {
            key_word_id: this.props.key_word_id
        }

        axios.post(`${serverAddress}key-words/progress`, body,
            {withCredentials: true})
        .then(response => {

            const wasHelpUsed = this.state.wasHelpUsed;
            const wasIncorrect = this.state.wasIncorrect;

            this.setState({
                userAnswer: "",
                correctAnswer: "",
                isAnswerCorrect: null,
                wasHelpUsed: false,
                wasIncorrect: false,
                errors: []
            });

            this.audio = null;

            this.props.onSubmitAnswer(wasHelpUsed, wasIncorrect, true);

        })
        .catch(err => {
            console.log(err);
            this.setState({
                errors: err.response.data.errors
            });
        })

    }

    onSubmit = (e) => {

        e.preventDefault();

        const answer = this.state.userAnswer.trim().toLowerCase();
        if (this.props.word === answer) {

            this.setState({
                isAnswerCorrect: true,
                userAnswer: answer
            }); 

            this.audio.play();

            this.audio.onended = () => {

                const wasHelpUsed = this.state.wasHelpUsed;
                const wasIncorrect = this.state.wasIncorrect;

                this.setState({
                    userAnswer: "",
                    correctAnswer: "",
                    isAnswerCorrect: null,
                    wasHelpUsed: false,
                    wasIncorrect: false,
                    errors: []
                });

                this.audio = null;
                
                this.props.onSubmitAnswer(wasHelpUsed, wasIncorrect, false);

            } 

        }
        else {
            this.setState({
                isAnswerCorrect: false,
                userAnswer: answer,
                wasIncorrect: true
            });
        }

    }

    render() {

        if (this.audio === null) {
            this.audio = new Audio(`${serverAddress}audio/${this.props.word}.mp3`);
            this.audio.play();
        }        

        let inputClass = "";
        if (this.state.isAnswerCorrect) {
            inputClass = " is-valid";
        }
        if (this.state.isAnswerCorrect === false) {
            inputClass = " is-invalid";
        }

        return(

            <div className="h-100 w-100 d-flex justify-content-center">
                <div className="h-100 d-flex flex-column justify-content-center">
                    <div className="d-flex flex-column m-0 pt-2 px-5 pb-5 border rounded bg-white card-shadow">
                        <div className="d-flex justify-content-end block-tab">
                            <div className="mr-2">
                                <button onClick={ this.onClickShowAnswer } className="btn text-white btn-sm border-0 training-btn">Answer</button>
                            </div>
                            <div>
                                <button onClick={ this.onClickAlreadyLearned } className="btn text-white btn-sm border-0 training-btn">Learned</button>
                            </div>
                        </div>
                        <div>
                            <form className="d-flex flex-column" method="post" onSubmit={ this.onSubmit }>
                                <div className="form-group mt-5">
                                    <input type="text" name="answer" placeholder={ this.state.correctAnswer } value={ this.state.userAnswer } onChange= { this.onChangeAnswer } className={ `form-control training-form-control${inputClass}` } id="exampleFormControlInput1" required />
                                </div>
                            </form>
                        </div>
                        <Keyboard onChange={ this.onChangeAnswer } onKeyPress={ () => {} } />
                    </div>
                </div>
            </div>

        );
    }

}

export default AudioWordCard;