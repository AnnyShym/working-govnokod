import React, { Component } from 'react';

import NavigationBar from '../NavigationBar';
import SeriesInfo from './SeriesInfo';
import AllSeasons from './AllSeasons';
import ReviewsBlock from '../reviews/ReviewsBlock';

class SeriesPage extends Component {
    render() {
        return(

            <div>
                <NavigationBar />
                <SeriesInfo seriesId={ this.props.match.params.id } />
                <AllSeasons seriesId={ this.props.match.params.id } />
                <ReviewsBlock seriesId={ this.props.match.params.id } />
            </div>

        );
    }
}

export default SeriesPage;
