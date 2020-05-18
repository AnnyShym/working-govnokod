import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import NavigationBar from '../NavigationBar';
import TranslationWordCard from './TranslationWordCard';
import AudioWordCard from './AudioWordCard';
import ResultsPage from './ResultsPage';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';
import getRandomInRange from '../../../modules/get_random_in_range';

import '../../../styles/training_page.css';
import '../../../styles/main_container.css';

class Training extends Component {

    constructor(props) {

        super(props);

        this.state = {
            vocabulary: null,
            currentId: 0,
            totalCount: 0,
            correctCount: 0,
            learnedCount: 0,
            isContinued: true,
            allowed: true,
            errors: []
        };

        this.MAX_CARDS_COUNT = 50;

    }

    componentDidMount() {
        this.getVocabulary();
    }

    getVocabulary() {
        axios.get(`${serverAddress}vocabulary`,
            {withCredentials: true})
        .then(response => {          
            this.setState({
                vocabulary: response.data.rows,
                currentId: (response.data.rows.length > 0) ? getRandomInRange(0, response.data.rows.length - 1) : 0,
                allowed: true,
                errors: []
            })
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.status ===
                statusCodes.UNAUTHORIZED) {
                this.setState({
                    vocabulary: [],
                    currentId: 0,
                    allowed: false,
                    errors: err.response.data.errors
                });
            } 
            else {
                this.setState({
                    vocabulary: [],
                    currentId: 0,
                    errors: err.response.data.errors
                });
            }
        })
    }

    handleSubmitAnswer = (wasHelpUsed, wasIncorrect, wasLearned) => {

        let correctCount = this.state.correctCount;
        if (!wasHelpUsed && !wasIncorrect) {
        	correctCount += 1;
        }

        let learnedCount = this.state.learnedCount;
        let vocabulary = this.state.vocabulary;
        if (wasLearned) {
        	learnedCount += 1;
            vocabulary.splice(this.state.currentId, 1);
        }

        let isContinued = this.state.isContinued;
        let currentId = getRandomInRange(0, this.state.vocabulary.length - 1);
        if (((this.state.totalCount + 1) > (this.state.vocabulary.length - 1)) ||
        	((this.state.totalCount + 1) > this.MAX_CARDS_COUNT)) {

        	isContinued = false;
            
            currentId = this.state.currentId;

        }

        this.setState({
            vocabulary: vocabulary,
            currentId: currentId,
            totalCount: this.state.totalCount + 1,
            correctCount: correctCount,
            learnedCount: learnedCount,
            isContinued: isContinued
        });

    }

    handleContinueTraining = () => {
        this.setState({
            currentId: getRandomInRange(0, this.state.vocabulary.length - 1),
            totalCount: 0,
            correctCount: 0,
            learnedCount: 0,
            isContinued: true
        });
    }

    render() {

        if ((this.props.match.params.kind !== "translation-word") &&
            (this.props.match.params.kind !== "audio-word")) {
            return null;
        }

    	if (this.state.vocabulary === null) {
    		return null;
    	}

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

    	if (this.state.vocabulary.length === 0) {
	        return(

	        	<div className="h-100">
		        	<NavigationBar />
		        	<div className="h-100 training-page main-container">
		            	<div className="alert alert-light card-shadow">
                            <div className="d-flex justify-content-center">
		            		    You have no words in your vocabulary. Check out our new episodes to get some material. :)
		            	    </div>
                        </div>
		            </div>
	            </div>

	        );
    	}

    	if (this.state.isContinued) {
	        return(

	        	<div className="h-100">
		        	<NavigationBar />
		        	<div className="h-100 training-page main-container">
                        { (this.props.match.params.kind === "translation-word") ?                              
                            <TranslationWordCard 
                                word={ this.state.vocabulary[this.state.currentId].word } 
                                translation={ this.state.vocabulary[this.state.currentId].translation } 
                                key_word_id={ this.state.vocabulary[this.state.currentId].key_word_id } 
                                onSubmitAnswer={ this.handleSubmitAnswer } />
                        :
                            <AudioWordCard 
                                word={ this.state.vocabulary[this.state.currentId].word } 
                                translation={ this.state.vocabulary[this.state.currentId].translation } 
                                key_word_id={ this.state.vocabulary[this.state.currentId].key_word_id } 
                                onSubmitAnswer={ this.handleSubmitAnswer } />
                        }
		            </div>
	            </div>

	        );    		
    	}
    	else {
    		return(

	        	<div className="h-100">
		        	<NavigationBar />
		        	<div className="h-100 training-page main-container">
		            	<ResultsPage 
		            		totalCount={ this.state.totalCount } 
		            		correctCount={ this.state.correctCount } 
		            		learnedCount={ this.state.learnedCount } 
		            		onContinueTraining={ this.handleContinueTraining } />
		            </div>
	            </div>

	        );   
    	}

    }

}

export default Training;