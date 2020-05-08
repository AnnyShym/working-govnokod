import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import '../../../styles/training_page.css';

class PlayGroundCard extends Component {
    render() {
        return(

            <div className="d-flex border rounded m-5 training-card card-shadow">
                <div className="card-body">
                    <h5 className="card-title text-white">{ this.props.title }</h5>
                    <Link to={ this.props.link } rel="noopener" className="btn training-btn text-white border-0">Go</Link>
                </div>
                <div>
                    <img src={ require(`../../../img/training-${this.props.number}.jpg`) } className="card-img-top rounded h-100" alt={ this.props.title } />
                </div>
            </div>

        );
    }
}

export default PlayGroundCard;
