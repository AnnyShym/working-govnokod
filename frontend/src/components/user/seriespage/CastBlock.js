import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import axios from 'axios';

import serverAddress from '../../../modules/server';
import statusCodes from '../../../modules/status_codes';

import '../../../styles/cast.css';

class CastBlock extends Component {

    constructor(props) {

        super(props);

        this.state = {
            actors: null,
            creators: null,
            producers: null,
            actorsTab: null,
            creatorsTab: null,
            producersTab: null,
            currentTab: 'Actors',
            allowed: true,
            errors: []
        };

    }

    componentDidMount() {
        this.getActors();
    }

    getActors = () => {
        axios.get(`${serverAddress}series/${this.props.seriesId}/actors`,
            {withCredentials: true})
        .then(response => {

            const tab = response.data.rows.map((actor, index) => 
                <div key={ index } className="cast-align d-flex justify-content-center">
                    <Link to={ `/actors/${actor.actor_id}` }>
                        <img src={ `${serverAddress}actors/small/${actor.actor_id}.jpg` } alt="Actor" width="50px" height="50px" className="round" />
                    </Link>
                </div>
            );

            this.setState({
                actors: response.data.rows,
                actorsTab: tab,
                allowed: true,
                errors: []
            });

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
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })
    }

    getCreators = () => {
        axios.get(`${serverAddress}series/${this.props.seriesId}/creators`,
            {withCredentials: true})
        .then(response => {

            const tab = response.data.rows.map((creator, index) => 
                <div key={ index } className="cast-align d-flex justify-content-center">
                    <Link to={ `/creators/${creator.creator_id}` } key={ index }>
                        <img src={ `${serverAddress}creators/small/${creator.creator_id}.jpg` } alt="Creator" width="50px" height="50px" className="round" />
                    </Link>
                </div>
            );

            this.setState({
                creators: response.data.rows,
                creatorsTab: tab,
                allowed: true,
                errors: []
            });

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
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })
    }

    getProducers = () => {
        axios.get(`${serverAddress}series/${this.props.seriesId}/producers`,
            {withCredentials: true})
        .then(response => {

            const tab = response.data.rows.map((producer, index) => 
                <div key={ index } className="cast-align d-flex justify-content-center">
                    <Link to={ `/producers/${producer.producer_id}` } key={ index }>
                        <img src={ `${serverAddress}producers/small/${producer.producer_id}.jpg` } alt="Producer" width="50px" height="50px" className="round" />
                    </Link>
                </div>
            );

            this.setState({
                producers: response.data.rows,
                producersTab: tab,
                allowed: true,
                errors: []
            });

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
            if (err.response && err.response.status ===
                statusCodes.INTERNAL_SERVER_ERROR) {
                this.setState({
                    errors: err.response.data.errors
                });
            }
        })
    }

    onClickActors = () => {

        if (this.state.actors === null) {
            this.getActors();
        }

        this.setState({ 
            currentTab: "Actors" 
        });

    }

    onClickCreators = () => {

        if (this.state.creators === null) {
            this.getCreators();
        }

        this.setState({ 
            currentTab: "Creators" 
        });

    }

    onClickProducers = () => {

        if (this.state.producers === null) {
            this.getProducers();
        }

        this.setState({ 
            currentTab: "Producers" 
        });

    }


    render() {

        if (!this.state.allowed) {
            return <Redirect to="/signin" />
        }

        let tab = <div></div>;
        if ((this.state.currentTab === "Actors") && (this.state.actors !== null)) {
            tab = this.state.actorsTab;
        }
        if ((this.state.currentTab === "Creators") && (this.state.creators !== null)) {
            tab = this.state.creatorsTab;
        }
        if ((this.state.currentTab === "Producers") && (this.state.producers !== null)) {
            tab = this.state.producersTab;
        }

        return(

            <div className="d-flex flex-column">
                <div className="d-flex justify-content-between">
                    <div onClick={ this.onClickCreators } 
                         className={ `pointer pb-2 px-2${ (this.state.currentTab === "Creators") ? " underlined font-weight-bold" : "" }` }>
                        Creators
                    </div>
                    <div onClick={ this.onClickActors } 
                         className={ `pointer pb-2 px-2${ (this.state.currentTab === "Actors") ? " underlined font-weight-bold" : "" }` }>
                        Actors
                    </div>
                    <div onClick={ this.onClickProducers } 
                         className={ `pointer pb-2 px-2${ (this.state.currentTab === "Producers") ? " underlined font-weight-bold" : "" }` }>
                        Producers
                    </div>
                </div>
                <div className="mt-3 d-flex justify-content-center flex-wrap">
                    { tab }
                </div>
            </div>

        )

    }
    
}

export default CastBlock;
