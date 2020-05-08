import React, { Component } from 'react';

import NavigationBar from '../NavigationBar';
import PlayGroundCard from './PlayGroundCard';

import '../../../styles/training_page.css';

class PlayGroundPage extends Component {
    render() {
        return(

        	<div className="training-page">
	        	<NavigationBar />
	            <div className="container d-flex main-container">
	                <PlayGroundCard number="1" title="Translation-Word" link="/training/translation-word" />
	                <PlayGroundCard number="2" title="Audio-Word" link="/training/audio-word" />
	            </div>
            </div>

        );
    }
}

export default PlayGroundPage;
