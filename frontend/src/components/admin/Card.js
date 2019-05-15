import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Card extends Component {
    render() {
        return(

            <div className="col">
                <div className="card" align="center">
                    <img src={ require('../../img/table_bg.jpg') } height="30" className="card-img-top" alt={ this.props.tableAlt } />
                    <div className="card-body">
                        <h5 className="card-title">{ this.props.tableAlt }</h5>
                        <Link to={ `/${this.props.table}` } rel="noopener" className="btn btn-primary">Go</Link>
                    </div>
                </div>
            </div>

        );
    }
}

export default Card;
