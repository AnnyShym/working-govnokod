import React, { Component } from 'react';
import Moment from 'react-moment';

import '../../../styles/comment.css';

class Comment extends Component {
    render() {
        return(

            <div className="d-flex flex-column mt-4">
                <div className="d-flex justify-content-between">
                    <div className="d-flex justify-content-start">
                        <div className="d-flex flex-column justify-content-center">
                            <img src={ require("../../../img/user.png") } alt="User" width="40px" height="40px" /> 
                        </div>
                        <div className="ml-2 d-flex flex-column justify-content-center">
                            <div className="font-weight-bold nickname">
                                { this.props.comment.nickname }
                            </div>
                            <div className="datetime">
                                <Moment format="MMM D YYYY, LT">
                                    { this.props.comment.datetime }
                                </Moment>
                            </div>
                        </div>
                    </div>
                    { (this.props.userId === this.props.comment.user_id) ?
                        <div onClick={ () => this.props.onDeleteComment(this.props.comment.comment_id) } className="d-flex flex-column justify-content-center pointer mr-2">
                            <img src={ require("../../../img/delete.png") } alt="Delete" width="15px" height="15px" /> 
                        </div>
                    :
                        <div></div>
                    }
                </div>
                <div className="d-flex flex-column bubble p-4">
                    {
                        this.props.comment.content.split('\n').map((str, index) =>
                            <span key={ index }>{ str }</span>
                        )
                    }
                </div>
            </div>

        );
    }
}

export default Comment;
