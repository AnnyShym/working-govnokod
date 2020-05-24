import React, { Component } from 'react';
import Moment from 'react-moment';

import '../../../styles/comment.css';

class Review extends Component {
    render() {

        const content = this.props.review.content.split('\n');

        return(

            <div className="d-flex flex-column mt-4">
                <div className="d-flex justify-content-between">
                    <div className="d-flex justify-content-start">
                        <div className="d-flex flex-column justify-content-center">
                            <img src={ require("../../../img/user.png") } alt="User" width="40px" height="40px" />
                        </div>
                        <div className="ml-2 d-flex flex-column justify-content-center">
                            <div className="font-weight-bold nickname">
                                { this.props.review.nickname }
                            </div>
                            <div className="datetime">
                                <Moment format="MMM D YYYY, LT">
                                    { this.props.review.datetime }
                                </Moment>
                            </div>
                        </div>
                    </div>
                    { (this.props.userId === this.props.review.user_id) ?
                        <div className="d-flex flex-column justify-content-center pointer mr-2">
                            <img src={ require("../../../img/delete.png") } alt="Delete" width="15px" height="15px" />
                        </div>
                    :
                        <div></div>
                    }
                </div>
                <div className="d-flex flex-column bubble p-4">
                    {
                        content.map((str, index) =>
                            ((index + 1) === content.length) ?
                                <p key={ index } className="mb-0">{ str }</p>
                            :
                                <p key={ index }>{ str }</p>
                        )
                    }
                </div>
            </div>

        );
    }
}

export default Review;
