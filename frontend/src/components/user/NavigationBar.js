import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';

import '../../styles/nav_bar.css';

class NavigationBar extends Component {

    constructor(props) {

        super(props);

        this.state = {
            loggedOut: false
        };

    }

    onClickLogOut = (e) => {
        // document.cookie = 'user_auth=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];;
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
        }

        this.setState({
            loggedOut: true
        })

    }

    render() {

        if (this.state.loggedOut) {
            return <Redirect to="/signin" />
        }

        return(

            <nav className="d-flex justify-content-between navbar navbar-expand-lg navbar-dark bg-dark nav-bar">
                <div className="d-flex justify-content-start">
                    <Link className="text-white m-0 p-0 text-decoration-none" to={'/series'}>
                        <img src={ require('../../img/film.ico') } alt="logo" width="9%" className="mr-2" />
                        Episodia
                    </Link>
                </div> 
                <div className="d-flex">
                    <Link to={'/play-ground'} className="nav-link btn btn-link text-secondary">PlayGround</Link>
                    <Link to={'/account'} className="nav-link btn btn-link text-secondary">Account</Link>
                    <Link to="" onClick={ this.onClickLogOut } className="nav-link btn btn-link text-secondary">Log Out</Link>
                </div>
            </nav>

        );
    }

}

export default NavigationBar;
