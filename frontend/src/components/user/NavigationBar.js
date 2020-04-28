import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';

import '../../styles/nav_bar.css';

class NavigationBar extends Component {

    constructor(props) {

        super(props);

        this.state = {
            loggedOut: false
        };

        this.onClickLogOut = this.onClickLogOut.bind(this);

    }

    onClickLogOut(e) {
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

            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <Link to={'/series'} className="navbar-brand" id="logo"><img src={ require('../../img/film.ico') } alt="logo" id="logo-img" />Episodia</Link>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                      <div>
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item" id="log-out">
                                <div onClick={ this.onClickLogOut } className="nav-link">Log Out</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

        );
    }

}

export default NavigationBar;
