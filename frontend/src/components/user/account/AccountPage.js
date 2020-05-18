import React, { Component } from 'react';

import NavigationBar from '../NavigationBar';
import AwardsPage from './AwardsPage';
import VocabularyPage from './VocabularyPage';
import FavouritesPage from './FavouritesPage';
import AlreadyWatchedPage from './AlreadyWatchedPage';
import WishListPage from './WishListPage';

import '../../../styles/main_container.css';
import '../../../styles/account.css';

class AccountPage extends Component {

    constructor(props) {

        super(props);

        this.state = {
            currentPage: null
        };

    }

    render() {

        let page = null;
        if (this.state.currentPage === 'Awards') {
            page = <AwardsPage />
        }
        if (this.state.currentPage === 'Vocabulary') {
            page = <VocabularyPage />
        }
        if (this.state.currentPage === 'Favourites') {
            page = <FavouritesPage />
        }
        if (this.state.currentPage === 'Already Watched') {
            page = <AlreadyWatchedPage />
        }
        if (this.state.currentPage === 'Wish List') {
            page = <WishListPage />
        }

        return(

            <div className="h-100">
                <NavigationBar />
                <div className="d-flex account-page main-container">
                    <div className="h-100 d-flex flex-column justify-content-between py-5 account-container account-shadow">
                        <div onClick={ () => this.setState({ currentPage: "Awards" }) } className="clr-yellow font-weight-bold d-flex justify-content-center account-link">
                            Awards
                        </div>
                        <div onClick={ () => this.setState({ currentPage: "Vocabulary" }) } className="clr-orange font-weight-bold d-flex justify-content-center account-link">
                            Vocabulary
                        </div>
                        <div onClick={ () => this.setState({ currentPage: "Favourites" }) } className="clr-purple font-weight-bold d-flex justify-content-center account-link">
                            Favourites
                        </div>
                        <div onClick={ () => this.setState({ currentPage: "Wish List" }) } className="clr-orange font-weight-bold d-flex justify-content-center account-link">
                            Wish List
                        </div>
                        <div onClick={ () => this.setState({ currentPage: "Already Watched" }) } className="clr-yellow font-weight-bold d-flex justify-content-center account-link">
                            Already Watched
                        </div>
                    </div>
                    <div className="page-container">
                        <div className="h-100">
                            { page }
                        </div>
                    </div>
                </div>
            </div>

        );

    }

}

export default AccountPage;
